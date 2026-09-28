import type * as PivotTransformModule from './pivot-transform-data-core'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPivotColumnGroupCells, getPivotValueCells } from './pivot-spec-cells'

// A Nuxt test environment compiles the auto-imported `getDateSimpleValue` into a
// real import, which the global stub below cannot replace. Its local day start
// matches the stubbed UTC day only in UTC, so pin the timezone.
const ORIGINAL_TZ = process.env.TZ
process.env.TZ = 'UTC'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

let transformModule: typeof PivotTransformModule

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('getDateTypes', () => ['date', 'dateSimple', 'datetime', 'datetimeSimple'])
  vi.stubGlobal('getNumberDataTypes', () => ['number', 'numberSimple'])
  vi.stubGlobal('getDateSimpleValue', (value: any) => {
    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime())
      ? Number.NaN
      : Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  })
  transformModule = await import('./pivot-transform-data-core')
})

afterAll(() => {
  process.env.TZ = ORIGINAL_TZ
})

function rowField(field: string, dataType = 'string') {
  return {
    field,
    dataType,
    minWidth: 100,
    width: '120px',
    widthResolved: '120px',
    resizable: true,
  } as any
}

function valueField(field: string, summaryType = summary.SUM, measureId = `${field}-${summaryType}`) {
  return {
    measureId,
    field,
    summaryType,
    widthResolved: '80px',
    _label: measureId,
  } as any
}

function transform(payload: {
  data: IItem[]
  rows: any[]
  columns?: any[]
  values: any[]
}) {
  return transformModule.pivotTransformDataCore({
    columns: [],
    ...payload,
  } as any)
}

function getDataRow(result: ReturnType<typeof transform>, groupPath: string[]) {
  return result.data.find(item => {
    return item.rowItem.kind === 'data'
      && item.groupPath.length === groupPath.length
      && item.groupPath.every((key, index) => key === groupPath[index])
  })
}

function getRowByKind(result: ReturnType<typeof transform>, kind: string, groupPath: string[] = []) {
  return result.data.find(item => {
    return item.rowItem.kind === kind
      && item.groupPath.every((key, index) => key === groupPath[index])
      && item.groupPath.length === groupPath.length
  })
}

function getCell(
  result: ReturnType<typeof transform>,
  row: ReturnType<typeof getDataRow>,
  predicate: (cell: any) => boolean,
) {
  return row ? getPivotValueCells(result, row).find(predicate) : undefined
}

const JAN_15 = String(Date.UTC(2024, 0, 15))
const JAN_16 = String(Date.UTC(2024, 0, 16))

describe('pivot aggregation keys', () => {
  it('aggregates values under a date row field', () => {
    const result = transform({
      data: [
        { from: new Date('2024-01-15T10:00:00.000Z'), duration: 10 },
        { from: '2024-01-15', duration: 5 },
        { from: new Date('2024-01-16T10:00:00.000Z'), duration: 7 },
      ],
      rows: [rowField('from', 'dateSimple')],
      values: [valueField('duration')],
    })

    const jan15 = getCell(result, getDataRow(result, [JAN_15]), cell => !cell.columnPath.length)
    const jan16 = getCell(result, getDataRow(result, [JAN_16]), cell => !cell.columnPath.length)

    expect(jan15).toMatchObject({ aggregated: 15, hasValue: true })
    expect(jan16).toMatchObject({ aggregated: 7, hasValue: true })
  })

  it('aggregates values under a date column field', () => {
    const result = transform({
      data: [
        { group: 'A', from: new Date('2024-01-15T10:00:00.000Z'), duration: 10 },
        { group: 'A', from: '2024-01-15', duration: 5 },
        { group: 'A', from: new Date('2024-01-16T10:00:00.000Z'), duration: 7 },
      ],
      rows: [rowField('group')],
      columns: [{ field: 'from', dataType: 'dateSimple' }],
      values: [valueField('duration')],
    })

    const row = getDataRow(result, ['A'])

    expect(result.valueColumns.map(column => column.columnPath)).toEqual([
      [JAN_15],
      [JAN_16],
      ['__grand_total__'],
    ])
    expect(getCell(result, row, cell => cell.columnPath[0] === JAN_15)).toMatchObject({ aggregated: 15, hasValue: true })
    expect(getCell(result, row, cell => cell.columnPath[0] === JAN_16)).toMatchObject({ aggregated: 7, hasValue: true })
  })

  it('orders number row and column fields numerically', () => {
    const result = transform({
      data: [10, 2, 1].map(value => ({ bucket: value, period: value, amount: 1 })),
      rows: [rowField('bucket', 'number')],
      columns: [{ field: 'period', dataType: 'number' }],
      values: [valueField('amount')],
    })

    const dataRowPaths = result.data
      .filter(item => item.rowItem.kind === 'data')
      .map(item => item.groupPath[0])

    expect(dataRowPaths).toEqual(['1', '2', '10'])
    expect(result.columnTree.map(node => node.key)).toEqual(['1', '2', '10'])
  })

  it('orders date fields chronologically', () => {
    const result = transform({
      data: [
        { from: '2024-01-16', amount: 1 },
        { from: '1999-12-31', amount: 1 },
        { from: '2024-01-15', amount: 1 },
      ],
      rows: [rowField('from', 'dateSimple')],
      values: [valueField('amount')],
    })

    const dataRowPaths = result.data
      .filter(item => item.rowItem.kind === 'data')
      .map(item => item.groupPath[0])

    expect(dataRowPaths).toEqual([String(Date.UTC(1999, 11, 31)), JAN_15, JAN_16])
  })

  it('keeps paths distinct when keys contain path separators', () => {
    const result = transform({
      data: [
        { level1: 'a/b', level2: 'c', amount: 1 },
        { level1: 'a', level2: 'b/c', amount: 10 },
        { level1: 'a:b', level2: 'c', amount: 100 },
      ],
      rows: [rowField('level1'), rowField('level2')],
      values: [valueField('amount')],
    })

    expect(getCell(result, getDataRow(result, ['a/b', 'c']), () => true)?.aggregated).toBe(1)
    expect(getCell(result, getDataRow(result, ['a', 'b/c']), () => true)?.aggregated).toBe(10)
    expect(getCell(result, getDataRow(result, ['a:b', 'c']), () => true)?.aggregated).toBe(100)
  })

  it('resolves dotted field paths for rows, columns, and values', () => {
    const result = transform({
      data: [
        { meta: { group: 'A', period: 'Q1' }, stats: { amount: 3 } },
        { meta: { group: 'A', period: 'Q1' }, stats: { amount: 4 } },
      ],
      rows: [rowField('meta.group')],
      columns: [{ field: 'meta.period' }],
      values: [valueField('stats.amount')],
    })

    const cell = getCell(result, getDataRow(result, ['A']), cell => cell.columnPath[0] === 'Q1')

    expect(cell).toMatchObject({ aggregated: 7, hasValue: true })
  })

  it('groups null, undefined, and empty values under the same empty key', () => {
    const result = transform({
      data: [
        { group: null, amount: 1 },
        { group: undefined, amount: 2 },
        { group: '', amount: 4 },
      ],
      rows: [rowField('group')],
      values: [valueField('amount')],
    })

    const dataRows = result.data.filter(item => item.rowItem.kind === 'data')

    expect(dataRows).toHaveLength(1)
    expect(getCell(result, dataRows[0], () => true)?.aggregated).toBe(7)
  })

  it('aggregates subtotals, grand totals, and empty intersections', () => {
    const result = transform({
      data: [
        { region: 'EU', country: 'CZ', period: 'Q1', amount: 1 },
        { region: 'EU', country: 'DE', period: 'Q2', amount: 2 },
        { region: 'US', country: 'NY', period: 'Q1', amount: 4 },
      ],
      rows: [rowField('region'), rowField('country')],
      columns: [{ field: 'period' }],
      values: [valueField('amount'), valueField('amount', summary.COUNT)],
    })

    const sumOf = (row: any, period: string) => getCell(result, row, cell => {
      return cell.measureId === 'amount-SUM' && cell.columnPath[0] === period
    })

    const czRow = getDataRow(result, ['EU', 'CZ'])
    const euHeader = getDataRow(result, ['EU'])
    const euSubtotal = getRowByKind(result, 'subtotal', ['EU'])
    const grandTotal = getRowByKind(result, 'grandTotal')

    expect(sumOf(czRow, 'Q1')).toMatchObject({ aggregated: 1, hasValue: true })
    expect(sumOf(czRow, 'Q2')).toMatchObject({ aggregated: 0, hasValue: false })
    expect(sumOf(euHeader, 'Q2')?.aggregated).toBe(2)
    expect(sumOf(euSubtotal, '__grand_total__')?.aggregated).toBe(3)
    expect(sumOf(grandTotal, 'Q1')?.aggregated).toBe(5)
    expect(sumOf(grandTotal, '__grand_total__')?.aggregated).toBe(7)
    expect(getCell(result, grandTotal, cell => {
      return cell.measureId === 'amount-COUNT' && cell.columnPath[0] === '__grand_total__'
    })?.aggregated).toBe(3)
  })

  it('leaves total cells without items blank, but shows totals that sum to 0', () => {
    const result = transform({
      data: [
        { region: 'EU', country: 'CZ', period: 'Q1', amount: 1 },
        { region: 'EU', country: 'DE', period: 'Q2', amount: 0 },
        { region: 'US', country: 'NY', period: 'Q1', amount: 4 },
      ],
      rows: [rowField('region'), rowField('country')],
      columns: [{ field: 'period' }],
      values: [valueField('amount')],
    })

    const sumOf = (row: any, period: string) => getCell(result, row, cell => cell.columnPath[0] === period)

    // US has no Q2 items: its subtotal cell is empty, like a data cell without items
    expect(sumOf(getRowByKind(result, 'subtotal', ['US']), 'Q2')).toMatchObject({ aggregated: 0, hasValue: false })
    // EU's Q2 items sum to 0: that total is a real 0
    expect(sumOf(getRowByKind(result, 'subtotal', ['EU']), 'Q2')).toMatchObject({ aggregated: 0, hasValue: true })
    expect(sumOf(getRowByKind(result, 'grandTotal'), 'Q2')).toMatchObject({ aggregated: 0, hasValue: true })
  })

  it('aggregates collapsed column groups from the index', () => {
    const result = transform({
      data: [
        { group: 'A', year: '2024', quarter: 'Q1', amount: 1 },
        { group: 'A', year: '2024', quarter: 'Q2', amount: 2 },
        { group: 'A', year: '2025', quarter: 'Q1', amount: 4 },
      ],
      rows: [rowField('group')],
      columns: [{ field: 'year' }, { field: 'quarter' }],
      values: [valueField('amount')],
    })

    const row = getDataRow(result, ['A'])!
    const groupCells = getPivotColumnGroupCells(result, row)

    expect(groupCells['2024:amount-SUM']?.aggregated).toBe(3)
    expect(groupCells['2025:amount-SUM']?.aggregated).toBe(4)
  })

  it('uses the first source item of each group as the row cell reference', () => {
    const first = { group: 'A', label: 'first', amount: 1 }
    const result = transform({
      data: [first, { group: 'A', label: 'second', amount: 2 }],
      rows: [rowField('group')],
      values: [valueField('amount')],
    })

    expect(getDataRow(result, ['A'])?.rowItem.cells[0]?.ref).toBe(first)
  })

  it('estimates projected rows from the distinct row paths', () => {
    const prepared = transformModule.preparePivotTransformData({
      data: [
        { region: 'EU', country: 'CZ', amount: 1 },
        { region: 'EU', country: 'DE', amount: 1 },
        { region: 'US', country: 'NY', amount: 1 },
      ],
      rows: [rowField('region'), rowField('country')],
      columns: [],
      values: [valueField('amount')],
    } as any)

    // 3 leaves + 2 group headers + 2 subtotals + grand total
    expect(prepared.estimate.projectedRowCount).toBe(8)
  })
})

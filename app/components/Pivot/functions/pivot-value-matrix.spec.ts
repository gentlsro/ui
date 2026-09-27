import { describe, expect, it, vi } from 'vitest'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import { getPivotTransformTransferables, pivotTransformDataCore } from './pivot-transform-data-core'
import { buildVisiblePivotValueColumns, getPivotColumnGroupId } from './pivot-column-collapse'
import { createPivotValueLayout, resolvePivotDisplayedValueCells } from './pivot-resolve-value-item'
import { applyPivotEmptyRows } from './pivot-transform-data'

vi.stubGlobal('SummaryEnum', { SUM: 'SUM', COUNT: 'COUNT', AVERAGE: 'AVERAGE', MEDIAN: 'MEDIAN' })

/**
 * Transform results carry values as typed arrays (one shared buffer per matrix, transferable from the worker);
 * value cells are built on demand for the rendered columns only, with the same content the old cell objects had
 */

// Stand-ins for the main-thread `PivotItem`s of the measures (a cell's `value`)
const SUM_ITEM = { field: 'amount', _label: 'Sum' }
const COUNT_ITEM = { field: 'amount', _label: 'Count' }
const VALUES = [
  { measureId: 'sum', field: 'amount', summaryType: 'SUM', widthResolved: '80px', _label: 'Sum', item: SUM_ITEM },
  { measureId: 'count', field: 'amount', summaryType: 'COUNT', widthResolved: '80px', _label: 'Count', item: COUNT_ITEM },
] as any[]
const COLUMNS = [{ field: 'year' }, { field: 'quarter' }] as any[]
const DATA = [
  { region: 'EU', year: '2024', quarter: 'Q1', amount: 10 },
  { region: 'EU', year: '2024', quarter: 'Q2', amount: 20 },
  { region: 'US', year: '2025', quarter: 'Q1', amount: 5 },
]

function transform(payload: { valuesOnRows?: boolean, values?: any[] } = {}) {
  return pivotTransformDataCore({
    data: DATA,
    rows: [{ field: 'region', dataType: 'string', minWidth: 1, width: '1px', widthResolved: '1px', resizable: true }] as any,
    columns: COLUMNS,
    values: payload.values ?? VALUES,
    valuesOnRows: payload.valuesOnRows,
  }) as IPivotTransformResult<any>
}

function cellsOf(result: IPivotTransformResult<any>, row: IPivotDataItem<any>, columns?: IPivotValueColumnItem<any>[]) {
  const layout = createPivotValueLayout({
    valueColumns: result.valueColumns,
    columnGroupKeys: result.columnGroupKeys,
    valueFields: VALUES,
  })

  return resolvePivotDisplayedValueCells({ row, columns: columns ?? result.valueColumns, layout })
}

function findRow(result: IPivotTransformResult<any>, kind: string, region?: string, measureId?: string) {
  return result.data.find(row => {
    return row.rowItem.kind === kind
      && (region === undefined || row.groupPath[0] === region)
      && (measureId === undefined || row.activeMeasureId === measureId)
  })!
}

function collapsedColumns(result: IPivotTransformResult<any>, valuesOnRows = false) {
  return buildVisiblePivotValueColumns({
    columnFields: COLUMNS,
    valueFields: VALUES,
    tree: result.columnTree,
    collapsedColumnGroupIds: new Set([getPivotColumnGroupId(['2024'], 0)]),
    allValueColumns: result.valueColumns,
    valuesOnRows,
  }).valueColumns
}

describe('pivot value matrix', () => {
  it('stores values in shared typed arrays instead of cell objects', () => {
    const result = transform()
    const buffers = new Set(result.data.map(row => row.valueItem.values!.buffer))

    for (const row of result.data) {
      expect(row.valueItem).not.toHaveProperty('cells')
      expect(row.valueItem).not.toHaveProperty('columnGroupCells')
      expect(row.valueItem.values).toBeInstanceOf(Float64Array)
      expect(row.valueItem.values).toHaveLength(result.valueColumns.length)
      expect(row.valueItem.hasValues).toBeInstanceOf(Uint8Array)
      expect(row.valueItem.columnGroupValues).toHaveLength(result.columnGroupKeys.length)
    }

    expect(buffers.size).toBe(1)
    expect(result.columnGroupKeys).toEqual(['2024:sum', '2024:count', '2025:sum', '2025:count'])
  })

  it('transfers the value buffers instead of copying them', () => {
    const result = transform()
    const transfer = getPivotTransformTransferables(result)
    const clone = structuredClone(result, { transfer })

    expect(new Set(transfer).size).toBe(transfer.length)
    expect(transfer.length).toBeGreaterThan(0)
    expect(transfer.every(buffer => buffer.byteLength === 0)).toBe(true)
    expect(cellsOf(clone, findRow(clone, 'grandTotal')).at(-2)?.aggregated).toBe(35)
  })

  it('builds cells like the former cell objects', () => {
    const result = transform()
    const eu = cellsOf(result, findRow(result, 'data', 'EU'))
    const euRow = findRow(result, 'data', 'EU')

    expect(eu.find(cell => cell.columnId === '2024/Q1:sum')).toEqual({
      id: `${euRow.valueItem.id}-2024/Q1:sum`,
      kind: 'data',
      columnId: '2024/Q1:sum',
      columnPath: ['2024', 'Q1'],
      measureId: 'sum',
      valueField: 'amount',
      value: SUM_ITEM,
      aggregated: 10,
      hasValue: true,
    })
    // An empty intersection of a data row has no value
    expect(eu.find(cell => cell.columnId === '2025/Q1:count')).toMatchObject({ aggregated: 0, hasValue: false })
    // A total row shows its aggregate wherever items fall into the cell
    expect(cellsOf(result, findRow(result, 'grandTotal')).find(cell => cell.columnId === 'grand-total:count'))
      .toMatchObject({ kind: 'grandTotal', aggregated: 3, hasValue: true, value: COUNT_ITEM })
  })

  it('resolves only the columns it is given', () => {
    const result = transform()
    const cells = cellsOf(result, findRow(result, 'data', 'US'), [result.valueColumns.at(-1)!])

    expect(cells.map(cell => [cell.columnId, cell.aggregated])).toEqual([['grand-total:count', 1]])
  })

  it('shows each measure of a collapsed column group', () => {
    const result = transform()
    const cells = cellsOf(result, findRow(result, 'data', 'EU'), collapsedColumns(result))

    expect(cells.map(cell => [cell.columnId, cell.measureId, cell.aggregated, cell.value])).toEqual([
      ['collapsed:2024:sum', 'sum', 30, SUM_ITEM],
      ['collapsed:2024:count', 'count', 2, COUNT_ITEM],
      ['2025/Q1:sum', 'sum', 0, SUM_ITEM],
      ['2025/Q1:count', 'count', 0, COUNT_ITEM],
      ['grand-total:sum', 'sum', 30, SUM_ITEM],
      ['grand-total:count', 'count', 2, COUNT_ITEM],
    ])
  })

  it('uses the row measure when values are on rows', () => {
    const result = transform({ valuesOnRows: true })
    const countRow = findRow(result, 'data', 'EU', 'count')

    expect(cellsOf(result, countRow).map(cell => [cell.columnId, cell.measureId, cell.aggregated, cell.value]))
      .toEqual([
        ['2024/Q1', 'count', 1, COUNT_ITEM],
        ['2024/Q2', 'count', 1, COUNT_ITEM],
        ['2025/Q1', 'count', 0, COUNT_ITEM],
        ['grand-total', 'count', 2, COUNT_ITEM],
      ])
    expect(cellsOf(result, countRow, collapsedColumns(result, true)).map(cell => [cell.columnId, cell.aggregated]))
      .toEqual([
        ['collapsed:2024', 2],
        ['2025/Q1', 0],
        ['grand-total', 2],
      ])
  })

  it('shows no values on inserted empty rows', () => {
    const result = transform()
    const [, emptyRow] = applyPivotEmptyRows([findRow(result, 'subtotal', 'EU') ?? findRow(result, 'data', 'EU')], {
      useEmptyRow: true,
      rowFieldCount: 1,
      collapsedGroupIds: new Set(),
      rowFields: [],
    })

    expect(emptyRow).toBeDefined()
    expect(cellsOf(result, emptyRow!).every(cell => cell.aggregated === 0 && !cell.hasValue)).toBe(true)
  })
})

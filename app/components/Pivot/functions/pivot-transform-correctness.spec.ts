import type * as PivotTransformModule from './pivot-transform-data-core'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { isPivotPerformanceOverBudget } from '../constants/pivot-performance.constant'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

let transformModule: typeof PivotTransformModule

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('useText', () => ({ normalizeText: (value: string) => value }))
  vi.stubGlobal('filterData', ({ data, filters }: any) => data.filter((row: any) => {
    return filters.every((filter: any) => row[filter.field] === filter.value)
  }))
  transformModule = await import('./pivot-transform-data-core')
})

function rowField<TField extends 'group' | 'secondary'>(field: TField) {
  return {
    field,
    dataType: 'string' as const,
    minWidth: 100,
    width: '120px',
    widthResolved: '120px',
    resizable: true,
  }
}

const columnFields = [{ field: 'period' as const }]

describe('pivot prepared transform correctness', () => {
  it('aggregates duplicate field measures independently by measure id', () => {
    const data = [
      { group: 'A', period: 'Q1', amount: 10 },
      { group: 'A', period: 'Q1', amount: 20 },
    ]
    const values = [
      {
        measureId: 'amount-sum',
        field: 'amount' as const,
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount (SUM)',
      },
      {
        measureId: 'amount-count',
        field: 'amount' as const,
        summaryType: summary.COUNT,
        widthResolved: '80px',
        _label: 'Amount (COUNT)',
      },
    ]

    const result = transformModule.pivotTransformDataCore({
      data,
      rows: [rowField('group')],
      columns: columnFields,
      values,
    })
    const row = result.data.find(item => item.groupPath[0] === 'A')!

    expect(row.valueItem.cells.find(cell => cell.measureId === 'amount-sum')?.aggregated).toBe(30)
    expect(row.valueItem.cells.find(cell => cell.measureId === 'amount-count')?.aggregated).toBe(2)
    expect(new Set(result.valueColumns.map(column => column.id)).size).toBe(result.valueColumns.length)
  })

  it('projects values on rows without changing aggregates or logical cell count', () => {
    const data = [
      { group: 'A', period: 'Q1', amount: 10 },
      { group: 'B', period: 'Q2', amount: 20 },
    ]
    const values = [
      {
        measureId: 'amount-sum',
        field: 'amount' as const,
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount',
      },
      {
        measureId: 'amount-count',
        field: 'amount' as const,
        summaryType: summary.COUNT,
        widthResolved: '80px',
        _label: 'Count',
      },
    ]
    const common = {
      data,
      rows: [rowField('group')],
      columns: columnFields,
      values,
    }
    const aggregation = transformModule.preparePivotAggregationData(common)
    const onColumns = transformModule.materializePivotTransformData(
      transformModule.projectPivotPreparedAggregation(aggregation),
    )
    const onRows = transformModule.materializePivotTransformData(
      transformModule.projectPivotPreparedAggregation(aggregation, { valuesOnRows: true }),
    )
    const columnsValue = onColumns.data
      .find(item => item.groupPath[0] === 'A')!
      .valueItem
      .cells
      .find(cell => cell.measureId === 'amount-sum' && cell.columnPath[0] === 'Q1')
    const rowsValue = onRows.data
      .find(item => item.groupPath[0] === 'A' && item.activeMeasureId === 'amount-sum')!
      .valueItem
      .cells
      .find(cell => cell.columnPath[0] === 'Q1')

    expect(rowsValue?.aggregated).toBe(columnsValue?.aggregated)
    expect(onRows.estimate.logicalCellCount).toBe(onColumns.estimate.logicalCellCount)
  })

  it('averages the middle pair for an even-sized median', () => {
    const result = transformModule.pivotTransformDataCore({
      data: [
        { group: 'A', amount: 2 },
        { group: 'A', amount: 8 },
      ],
      rows: [rowField('group')],
      columns: [],
      values: [{
        measureId: 'amount-median',
        field: 'amount',
        summaryType: summary.MEDIAN,
        widthResolved: '80px',
        _label: 'Median amount',
      }],
    })
    const row = result.data.find(item => item.groupPath[0] === 'A')!

    expect(row.valueItem.cells.find(cell => !cell.columnPath.length)?.aggregated).toBe(5)
  })

  it('uses collision-safe identities for row paths', () => {
    const result = transformModule.pivotTransformDataCore({
      data: [
        { group: 'a/b', secondary: 'c', amount: 1 },
        { group: 'a', secondary: 'b/c', amount: 2 },
      ],
      rows: [rowField('group'), rowField('secondary')],
      columns: [],
      values: [{
        measureId: 'amount-sum',
        field: 'amount',
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount',
      }],
    })
    const leafIds = result.data
      .filter(item => item.groupPath.length === 2 && item.rowItem.kind === 'data')
      .map(item => item.id)

    expect(new Set(leafIds).size).toBe(2)
  })

  it('keeps sentinel-like source values separate from generated totals', () => {
    const result = transformModule.pivotTransformDataCore({
      data: [
        { group: '__grand_total__', amount: 5 },
        { group: 'normal', amount: 7 },
      ],
      rows: [rowField('group')],
      columns: [],
      values: [{
        measureId: 'amount-sum',
        field: 'amount',
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount',
      }],
    })
    const sourceRow = result.data.find(row => row.groupPath[0] === '__grand_total__')!
    const grandTotal = result.data.find(row => row.rowItem.kind === 'grandTotal')!

    expect(sourceRow.valueItem.cells.find(cell => !cell.columnPath.length)?.aggregated).toBe(5)
    expect(grandTotal.valueItem.cells.find(cell => !cell.columnPath.length)?.aggregated).toBe(12)
  })

  it('builds rows and column members from filtered data', () => {
    const result = transformModule.pivotTransformDataCore({
      data: [
        { group: 'A', period: 'Q1', amount: 1 },
        { group: 'B', period: 'Q2', amount: 2 },
      ],
      rows: [rowField('group')],
      columns: columnFields,
      values: [{
        measureId: 'amount-sum',
        field: 'amount',
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount',
      }],
      filters: [{
        field: 'period',
        dataType: 'string',
        comparator: 'eq' as never,
        filterValue: 'Q1',
      }],
    })

    expect(result.data.some(row => row.groupPath[0] === 'A')).toBe(true)
    expect(result.data.some(row => row.groupPath[0] === 'B')).toBe(false)
    expect(result.valueColumns.some(column => column.columnPath[0] === 'Q1')).toBe(true)
    expect(result.valueColumns.some(column => column.columnPath[0] === 'Q2')).toBe(false)
  })

  it('reports exact output cardinality before materialization', () => {
    const prepared = transformModule.preparePivotTransformData({
      data: [
        { group: 'A', period: 'Q1', amount: 1 },
        { group: 'B', period: 'Q2', amount: 2 },
      ],
      rows: [rowField('group')],
      columns: columnFields,
      values: [{
        measureId: 'amount-sum',
        field: 'amount',
        summaryType: summary.SUM,
        widthResolved: '80px',
        _label: 'Amount',
      }],
    })

    expect(prepared.estimate).toEqual({
      sourceRowCount: 2,
      projectedRowCount: 3,
      valueColumnCount: 3,
      logicalCellCount: 9,
    })
    expect(isPivotPerformanceOverBudget(prepared.estimate, {
      outputCellWarningThreshold: 8,
    })).toBe(true)
  })

  it('precomputes exact collapsed-column aggregates per measure', () => {
    const result = transformModule.pivotTransformDataCore({
      data: [
        { group: 'A', division: 'Europe', period: 'Q1', amount: 10 },
        { group: 'A', division: 'Europe', period: 'Q2', amount: 20 },
      ],
      rows: [rowField('group')],
      columns: [{ field: 'division' }, { field: 'period' }],
      values: [
        {
          measureId: 'amount-average',
          field: 'amount',
          summaryType: summary.AVERAGE,
          widthResolved: '80px',
          _label: 'Average amount',
        },
        {
          measureId: 'amount-median',
          field: 'amount',
          summaryType: summary.MEDIAN,
          widthResolved: '80px',
          _label: 'Median amount',
        },
      ],
    })
    const cells = result.data.find(item => item.groupPath[0] === 'A')!
      .valueItem
      .columnGroupCells!

    expect(cells['Europe:amount-average']?.aggregated).toBe(15)
    expect(cells['Europe:amount-median']?.aggregated).toBe(15)
  })
})

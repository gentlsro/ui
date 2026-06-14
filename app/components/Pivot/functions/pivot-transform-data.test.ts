import { describe, expect, it } from 'vitest'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import { PivotColumn } from '../models/pivot-column.model'
import { PivotRow } from '../models/pivot-row.model'
import { PivotValue } from '../models/pivot-value.model'
import {
  buildPivotAggregationIndex,
  getPivotAggregatedValue,
} from './pivot-aggregate-values'
import {
  applyPivotEmptyRows,
  pivotTransformData,
  shouldInsertPivotEmptyRowAfter,
} from './pivot-transform-data'

type ITestItem = {
  region: string
  category: string
  product: string
  year: string
  quarter: string
  revenue: number
  units: number
}

const TEST_DATA: ITestItem[] = [
  { region: 'North', category: 'A', product: 'P1', year: '2024', quarter: 'Q1', revenue: 100, units: 2 },
  { region: 'North', category: 'A', product: 'P2', year: '2024', quarter: 'Q1', revenue: 200, units: 3 },
  { region: 'North', category: 'B', product: 'P3', year: '2024', quarter: 'Q2', revenue: 50, units: 1 },
  { region: 'South', category: 'B', product: 'P4', year: '2025', quarter: 'Q1', revenue: 75, units: 4 },
]

const ROW_FIELDS = [
  new PivotRow<ITestItem>({ field: 'region', dataType: 'string' }),
  new PivotRow<ITestItem>({ field: 'category', dataType: 'string' }),
]

const COLUMN_FIELDS = [
  new PivotColumn<ITestItem>({ field: 'year' }),
  new PivotColumn<ITestItem>({ field: 'quarter' }),
]

const VALUE_FIELDS = [
  new PivotValue<ITestItem>({ field: 'revenue', summaryType: SummaryEnum.SUM }),
  new PivotValue<ITestItem>({ field: 'units', summaryType: SummaryEnum.SUM }),
]

function createTransformPayload(data: ITestItem[] = TEST_DATA) {
  return {
    data,
    rows: ROW_FIELDS,
    columns: COLUMN_FIELDS,
    values: VALUE_FIELDS,
    state: {
      collapsedGroupIds: new Set<string>(),
      collapsedColumnGroupIds: new Set<string>(),
    },
    collapseConfig: { expandedLevelOnInit: 0 },
    isFirstRender: ref(true),
    formatNumber: (value: number) => String(value),
  }
}

describe('buildPivotAggregationIndex', () => {
  it('aggregates leaf column and grand total values in one pass', () => {
    const northItems = TEST_DATA.filter(item => item.region === 'North')
    const index = buildPivotAggregationIndex({
      items: northItems,
      columnFields: COLUMN_FIELDS,
      valueFields: VALUE_FIELDS,
    })

    expect(getPivotAggregatedValue({
      index,
      columnPath: ['2024', 'Q1'],
      valueField: 'revenue' as ObjectKey<ITestItem>,
    })).toEqual({ aggregated: 300, matchCount: 2 })

    expect(getPivotAggregatedValue({
      index,
      columnPath: ['__grand_total__'],
      valueField: 'revenue' as ObjectKey<ITestItem>,
    })).toEqual({ aggregated: 350, matchCount: 3 })
  })

  it('supports count summary type', () => {
    const index = buildPivotAggregationIndex({
      items: TEST_DATA,
      columnFields: COLUMN_FIELDS,
      valueFields: [new PivotValue<ITestItem>({ field: 'revenue', summaryType: SummaryEnum.COUNT })],
    })

    expect(getPivotAggregatedValue({
      index,
      columnPath: ['2024', 'Q1'],
      valueField: 'revenue' as ObjectKey<ITestItem>,
    })).toEqual({ aggregated: 2, matchCount: 2 })
  })
})

describe('pivotTransformData', () => {
  it('returns empty data when rows are missing', () => {
    const result = pivotTransformData({
      ...createTransformPayload(),
      rows: [],
    })

    expect(result.data).toEqual([])
    expect(result.valueColumns.length).toBeGreaterThan(0)
  })

  it('builds subtotal and grand total rows with aggregated values', () => {
    const result = pivotTransformData(createTransformPayload())
    const grandTotal = result.data.find(row => row.rowItem.kind === 'grandTotal')
    const northSubtotal = result.data.find(row =>
      row.rowItem.kind === 'subtotal' && row.label === 'North',
    )

    expect(grandTotal?.valueItem.cells.find(cell => cell.columnId.includes('grand-total|revenue'))?.aggregated)
      .toBe(425)

    expect(northSubtotal?.valueItem.cells.find(cell => cell.columnPath.join('|') === '2024|Q1')?.aggregated)
      .toBe(300)
  })

  it('stores collapsed group value items on first child row labels', () => {
    const result = pivotTransformData(createTransformPayload())
    const northFirstCategoryRow = result.data.find(row =>
      row.rowItem.kind === 'data'
      && row.label === 'North / A',
    )

    expect(northFirstCategoryRow?.valueItem.collapsedGroupValueItems).toBeDefined()

    const collapsedGroupId = northFirstCategoryRow?.groupIds[0]
    const collapsedItem = collapsedGroupId
      ? northFirstCategoryRow?.valueItem.collapsedGroupValueItems?.[collapsedGroupId]
      : undefined

    expect(collapsedItem?.cells.find(cell => cell.columnPath.join('|') === '2024|Q1')?.aggregated)
      .toBe(300)
  })
})

describe('applyPivotEmptyRows', () => {
  it('inserts empty rows after subtotal rows when enabled', () => {
    const result = pivotTransformData(createTransformPayload())
    const withEmptyRows = applyPivotEmptyRows(result.data, {
      useEmptyRow: true,
      rowFieldCount: ROW_FIELDS.length,
      collapsedGroupIds: new Set<string>(),
      rowFields: ROW_FIELDS,
      valueColumns: result.valueColumns,
    })

    expect(withEmptyRows.some(row => row.rowItem.kind === 'emptyRow')).toBe(true)
  })
})

describe('shouldInsertPivotEmptyRowAfter', () => {
  it('returns true for subtotal rows', () => {
    const result = pivotTransformData(createTransformPayload())
    const subtotalRow = result.data.find(row => row.rowItem.kind === 'subtotal')

    expect(subtotalRow).toBeDefined()
    expect(shouldInsertPivotEmptyRowAfter({
      row: subtotalRow!,
      collapsedGroupIds: new Set<string>(),
      rowFieldCount: ROW_FIELDS.length,
    })).toBe(true)
  })
})

describe('pivotTransformData performance', () => {
  it('transforms a 10k demo workload within a reasonable budget', () => {
    const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America'] as const
    const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'] as const
    const data: ITestItem[] = Array.from({ length: 10_000 }, (_, index) => ({
      region: REGIONS[index % REGIONS.length]!,
      category: CATEGORIES[index % CATEGORIES.length]!,
      product: `Product ${index}`,
      year: String(2023 + (index % 3)),
      quarter: `Q${(index % 4) + 1}`,
      revenue: (index % 500) + 1,
      units: (index % 50) + 1,
    }))

    const rows = [
      new PivotRow<ITestItem>({ field: 'region', dataType: 'string' }),
      new PivotRow<ITestItem>({ field: 'category', dataType: 'string' }),
      new PivotRow<ITestItem>({ field: 'product', dataType: 'string' }),
    ]

    const startedAt = performance.now()
    const result = pivotTransformData({
      ...createTransformPayload(data),
      rows,
    })
    const elapsed = performance.now() - startedAt

    expect(result.data.length).toBeGreaterThan(0)
    expect(elapsed).toBeLessThan(3000)
  })
})

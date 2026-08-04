import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { PivotItem } from '../models/pivot-item.model'
import { getInitialCollapsedGroupIds, isPivotRowVisible } from './pivot-group-collapse'
import { pivotTransformData } from './pivot-transform-data'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

vi.stubGlobal('SummaryEnum', summary)

type RowData = {
  center: string
  car: string
  plate: string
  month: string
  revenue: number
  cost: number
}

const nestedData: RowData[] = [
  { center: 'Frigo', car: 'Truck', plate: 'ABC', month: '2026-01', revenue: 100, cost: 40 },
  { center: 'Frigo', car: 'Van', plate: 'DEF', month: '2026-01', revenue: 50, cost: 20 },
]

const nestedRows = [
  { field: 'center' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'car' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'plate' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
] as unknown as PivotItem<RowData>[]

const columns = [{ field: 'month' as const }] as unknown as PivotItem<RowData>[]
const values = [
  { measureId: 'revenue-sum', field: 'revenue' as const, summaryType: summary.SUM, widthResolved: '80px', _label: 'Revenue' },
  { measureId: 'cost-sum', field: 'cost' as const, summaryType: summary.SUM, widthResolved: '80px', _label: 'Cost' },
]

describe('pivotTransformData expandedLevelOnInit', () => {
  const formatNumber = (value: number) => String(value)

  it('waits for non-empty data before consuming isFirstRender', () => {
    const isFirstRender = ref(true)
    const state = {
      collapsedGroupIds: new Set<string>(),
      collapsedColumnGroupIds: new Set<string>(),
    }

    pivotTransformData({
      data: [],
      rows: nestedRows,
      columns,
      values,
      state,
      isFirstRender,
      collapseConfig: { expandedLevelOnInit: 0 },
      formatNumber,
      valuesOnRows: true,
    })

    expect(isFirstRender.value).toBe(true)
    expect(state.collapsedGroupIds.size).toBe(0)

    const result = pivotTransformData({
      data: nestedData,
      rows: nestedRows,
      columns,
      values,
      state,
      isFirstRender,
      collapseConfig: { expandedLevelOnInit: 0 },
      formatNumber,
      valuesOnRows: true,
    })

    expect(isFirstRender.value).toBe(false)

    const expectedCollapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: 0,
      rowFieldCount: nestedRows.length,
    })

    expect(state.collapsedGroupIds).toEqual(expectedCollapsedGroupIds)

    const visiblePaths = result.data
      .filter(row => isPivotRowVisible(row, state.collapsedGroupIds, nestedRows.length))
      .filter(row => row.rowItem.kind === 'data' && row.activeValueField === 'revenue')
      .map(row => row.groupPath.join('|'))

    expect(visiblePaths).toEqual(['Frigo'])
  })
})

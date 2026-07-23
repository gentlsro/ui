import { describe, expect, it } from 'vitest'
import { getInitialCollapsedGroupIds, isPivotRowCellHiddenByCollapsedAncestor, isPivotRowVisible } from './pivot-group-collapse'
import { pivotTransformDataCore } from './pivot-transform-data-core'

const nestedData = [
  { center: 'Frigo', car: 'Truck', plate: 'ABC', month: '2026-01', revenue: 100, cost: 40 },
  { center: 'Frigo', car: 'Van', plate: 'DEF', month: '2026-01', revenue: 50, cost: 20 },
]

const nestedRows = [
  { field: 'center' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'car' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'plate' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
]

const columns = [{ field: 'month' as const }]
const values = [
  { field: 'revenue' as const, summaryType: SummaryEnum.SUM, widthResolved: '80px', _label: 'Revenue' },
  { field: 'cost' as const, summaryType: SummaryEnum.SUM, widthResolved: '80px', _label: 'Cost' },
]

describe('pivot group collapse with nested rows', () => {
  const result = pivotTransformDataCore({
    data: nestedData,
    rows: nestedRows,
    columns,
    values,
    valuesOnRows: true,
  })

  it('collapsed center shows only center header measure rows', () => {
    const collapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: 0,
      rowFieldCount: nestedRows.length,
    })

    const visible = result.data.filter(row => isPivotRowVisible(row, collapsedGroupIds, nestedRows.length))
    const visiblePaths = visible
      .filter(row => row.rowItem.kind === 'data' && row.activeValueField === 'revenue')
      .map(row => row.groupPath.join('|'))

    expect(visiblePaths).toEqual(['Frigo'])
  })

  it('collapsed center hides subtotal measure rows', () => {
    const collapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: 0,
      rowFieldCount: nestedRows.length,
    })

    const visible = result.data.filter(row => isPivotRowVisible(row, collapsedGroupIds, nestedRows.length))
    const visibleSubtotals = visible.filter(row => row.rowItem.kind === 'subtotal')

    expect(visibleSubtotals).toHaveLength(0)
  })

  it('does not hide sibling stredisko labels when another stredisko prefix matches', () => {
    const collapsedGroupIds = new Set(['0:Distibuce - frigo'])

    expect(isPivotRowCellHiddenByCollapsedAncestor('0:Distibuce - frigo režie', collapsedGroupIds)).toBe(false)
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:Distibuce - frigo|', collapsedGroupIds)).toBe(true)
    expect(isPivotRowCellHiddenByCollapsedAncestor('0:Distibuce - frigo', collapsedGroupIds)).toBe(false)
  })

  it('expanded center hides center summary and shows collapsed car headers', () => {
    const collapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: 1,
      rowFieldCount: nestedRows.length,
    })

    const visible = result.data.filter(row => isPivotRowVisible(row, collapsedGroupIds, nestedRows.length))
    const visiblePaths = visible
      .filter(row => row.rowItem.kind === 'data' && row.activeValueField === 'revenue')
      .map(row => row.groupPath.join('|'))

    expect(visiblePaths).not.toContain('Frigo')
    expect(visiblePaths).toContain('Frigo|Truck')
    expect(visiblePaths).toContain('Frigo|Van')
    expect(visiblePaths).not.toContain('Frigo|Truck|ABC')
    expect(visiblePaths).not.toContain('Frigo|Van|DEF')
  })

  it('fully expanded center shows plate rows', () => {
    const collapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: 2,
      rowFieldCount: nestedRows.length,
    })

    const visible = result.data.filter(row => isPivotRowVisible(row, collapsedGroupIds, nestedRows.length))
    const visiblePaths = visible
      .filter(row => row.rowItem.kind === 'data' && row.activeValueField === 'revenue')
      .map(row => row.groupPath.join('|'))

    expect(visiblePaths).toContain('Frigo|Truck|ABC')
    expect(visiblePaths).toContain('Frigo|Van|DEF')
  })
})

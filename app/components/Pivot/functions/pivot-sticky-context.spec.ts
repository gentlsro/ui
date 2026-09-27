import { describe, expect, it, vi } from 'vitest'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import {
  getPivotGroupId,
  getPivotRowContextLevels,
  getPivotStickyIndices,
  isPivotRowVisible,
} from './pivot-group-collapse'
import { pivotTransformDataCore } from './pivot-transform-data-core'

vi.stubGlobal('SummaryEnum', { SUM: 'SUM', COUNT: 'COUNT', AVERAGE: 'AVERAGE', MEDIAN: 'MEDIAN' })

/**
 * A pinned (stuck) row shows the labels of the groups the first visible row is inside of. With one pinned row, that
 * only works if the pinned row always has the same group context as the first visible row, so rows become sticky
 * exactly where the context changes.
 */

function rowField(field: string) {
  return { field, dataType: 'string', minWidth: 100, width: '120px', widthResolved: '120px', resizable: true } as any
}

const data = [
  { region: 'EU', day: 'd1', bucket: 'b1', amount: 1 },
  { region: 'EU', day: 'd2', bucket: 'b1', amount: 1 },
  { region: 'EU', day: 'd2', bucket: 'b2', amount: 1 },
  { region: 'EU', day: 'd3', bucket: 'b1', amount: 1 },
  { region: 'US', day: 'd1', bucket: 'b1', amount: 1 },
]
const ROW_FIELD_COUNT = 3

function visibleRows(collapsedGroupIds: Set<string>, valuesOnRows = false): IPivotDataItem[] {
  const result = pivotTransformDataCore({
    data,
    rows: [rowField('region'), rowField('day'), rowField('bucket')],
    columns: [],
    values: [
      { measureId: 'sum', field: 'amount', summaryType: 'SUM', widthResolved: '80px', _label: 'Sum' },
      { measureId: 'count', field: 'amount', summaryType: 'COUNT', widthResolved: '80px', _label: 'Count' },
    ] as any,
    valuesOnRows,
  })

  return (result.data as IPivotDataItem[]).filter(row => isPivotRowVisible(row, collapsedGroupIds, ROW_FIELD_COUNT))
}

// EU and EU > d2 expanded; EU > d1, EU > d3, and US collapsed
const collapsed = new Set([
  getPivotGroupId(['EU', 'd1'], 1),
  getPivotGroupId(['EU', 'd3'], 1),
  getPivotGroupId(['US'], 0),
])

function describeRow(row: IPivotDataItem) {
  return `${row.rowItem.kind}:${row.groupPath.join('/')}`
}

function contextOf(rows: IPivotDataItem[], description: string) {
  const row = rows.find(row => describeRow(row) === description)!

  return getPivotRowContextLevels({ row, collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT })
}

describe('pivot row group context', () => {
  const rows = visibleRows(collapsed)

  it('lists the visible rows this suite relies on', () => {
    expect(rows.map(describeRow)).toEqual([
      'data:EU/d1',
      'data:EU/d2/b1',
      'data:EU/d2/b2',
      'subtotal:EU/d2',
      'data:EU/d3',
      'subtotal:EU',
      'data:US',
      'grandTotal:',
    ])
  })

  it('includes every expanded group a row is inside of', () => {
    expect(contextOf(rows, 'data:EU/d2/b1')).toEqual([0, 1])
    expect(contextOf(rows, 'data:EU/d2/b2')).toEqual([0, 1])
  })

  it('excludes the group a collapsed row summarizes', () => {
    expect(contextOf(rows, 'data:EU/d1')).toEqual([0])
    expect(contextOf(rows, 'data:US')).toEqual([])
  })

  it('keeps a subtotal inside the group it totals', () => {
    expect(contextOf(rows, 'subtotal:EU/d2')).toEqual([0, 1])
    expect(contextOf(rows, 'subtotal:EU')).toEqual([0])
  })

  it('has no context for the grand total', () => {
    expect(contextOf(rows, 'grandTotal:')).toEqual([])
  })
})

describe('pivot sticky indices', () => {
  it('marks the rows where the group context changes', () => {
    const rows = visibleRows(collapsed)
    const sticky = getPivotStickyIndices(rows, { collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT })

    // [EU] | [EU, d2] x3 | [EU] x2 | [] x2
    expect(sticky.map(index => describeRow(rows[index]!))).toEqual([
      'data:EU/d1',
      'data:EU/d2/b1',
      'data:EU/d3',
      'data:US',
    ])
  })

  it('pins a row with the same context as every row until the next sticky row', () => {
    const rows = visibleRows(collapsed)
    const sticky = getPivotStickyIndices(rows, { collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT })
    const contextKey = (row: IPivotDataItem) => {
      return getPivotRowContextLevels({ row, collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT }).join()
        + getPivotRowContextLevels({ row, collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT })
          .map(level => row.groupIds[level])
          .join()
    }

    rows.forEach((row, index) => {
      const active = sticky.findLast(stickyIndex => stickyIndex <= index)!

      expect(contextKey(rows[active]!)).toBe(contextKey(row))
    })
  })

  it('does not split the measure rows of one group (values on rows)', () => {
    const rows = visibleRows(collapsed, true)
    const sticky = getPivotStickyIndices(rows, { collapsedGroupIds: collapsed, rowFieldCount: ROW_FIELD_COUNT })

    expect(sticky.map(index => `${describeRow(rows[index]!)}#${rows[index]!.measureIndex}`)).toEqual([
      'data:EU/d1#0',
      'data:EU/d2/b1#0',
      'data:EU/d3#0',
      'data:US#0',
    ])
  })

  it('is empty when no row is inside an expanded group', () => {
    const allCollapsed = new Set([getPivotGroupId(['EU'], 0), getPivotGroupId(['US'], 0)])
    const rows = visibleRows(allCollapsed)

    expect(getPivotStickyIndices(rows, { collapsedGroupIds: allCollapsed, rowFieldCount: ROW_FIELD_COUNT })).toEqual([])
    expect(getPivotStickyIndices(rows, { collapsedGroupIds: new Set(), rowFieldCount: 1 })).toEqual([])
  })
})

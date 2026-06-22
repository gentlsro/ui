import { describe, expect, it } from 'vitest'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import { getInitialCollapsedGroupIds, getPivotPromotedRowLabelLevels, isPivotRowVisible } from './pivot-group-collapse'
import { pivotTransformDataCore } from './pivot-transform-data-core'
import raw from '~/data/najezd-spotreba-stredisko.json'

const METRICS = [
  'Výnosy', 'Náklady', 'Režijní náklady', 'Marže v %', 'Spotřeba PHM v l',
  'Najeto km', 'Spotřeba měsíční l/100 km', 'Převezeno (kg)', 'Převezeno (m3)',
] as const

const values = METRICS.map(field => ({
  field,
  summaryType: SummaryEnum.SUM,
  widthResolved: '80px',
  _label: field,
}))

const rows = [
  { field: 'stredisko' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'nazevAuta' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
  { field: 'spz' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true },
]

const columns = [{ field: 'mesic' as const }]

describe('frigo collapsed block has no ghost rows', () => {
  const result = pivotTransformDataCore({ data: raw, rows, columns, values, valuesOnRows: true })
  const collapsed = getInitialCollapsedGroupIds({
    data: result.data,
    expandedLevelOnInit: 0,
    rowFieldCount: rows.length,
  })
  const visible = result.data.filter(row => isPivotRowVisible(row, collapsed, rows.length))

  it('frigo block is exactly 9 rows with no subtotals or deeper paths', () => {
    const frigoRows = visible.filter(row =>
      row.groupPath[0] === 'Distibuce - frigo'
      && row.rowItem.kind === 'data'
      && row.groupPath.length === 1,
    )

    expect(frigoRows).toHaveLength(9)
  })

  it('no visible rows under collapsed frigo except the 9 header measures', () => {
    const leaked = visible.filter(row =>
      row.groupPath[0] === 'Distibuce - frigo'
      && (row.groupPath.length > 1 || row.rowItem.kind !== 'data'),
    )

    expect(leaked).toEqual([])
  })

  it('no spz rows leak when frigo collapsed', () => {
    const leaked = visible.filter(row => String(row.id).startsWith('Distibuce - frigo||'))

    expect(leaked).toEqual([])
  })
})

describe('frigo expanded with nazevAuta collapsed', () => {
  const result = pivotTransformDataCore({ data: raw, rows, columns, values, valuesOnRows: true })
  const collapsed = getInitialCollapsedGroupIds({
    data: result.data,
    expandedLevelOnInit: 0,
    rowFieldCount: rows.length,
  })

  collapsed.delete('0:Distibuce - frigo')

  const visible = result.data.filter(row => isPivotRowVisible(row, collapsed, rows.length))
  const frigoRows = visible.filter(row => row.groupPath[0] === 'Distibuce - frigo')

  it('shows collapsed nazevAuta summary and stredisko subtotal only', () => {
    const dataRows = frigoRows.filter(row => row.rowItem.kind === 'data')
    const subtotalRows = frigoRows.filter(row => row.rowItem.kind === 'subtotal')

    expect(dataRows).toHaveLength(9)
    expect(dataRows.every(row => row.groupPath.length === 2)).toBe(true)
    expect(subtotalRows).toHaveLength(9)
    expect(subtotalRows.every(row => row.groupPath.length === 1)).toBe(true)
  })

  it('does not show stredisko summary or spz rows', () => {
    expect(frigoRows.some(row => row.groupPath.length === 1 && row.rowItem.kind === 'data')).toBe(false)
    expect(frigoRows.some(row => row.groupPath.length === 3)).toBe(false)
  })

  it('promotes stredisko label to the first visible child row', () => {
    const firstRow = frigoRows[0]!
    const firstRowIndex = visible.indexOf(firstRow)

    expect(getPivotPromotedRowLabelLevels({
      row: firstRow,
      visibleRows: visible,
      rowIndex: firstRowIndex,
      collapsedGroupIds: collapsed,
      rowFieldCount: rows.length,
    })).toEqual([0])
  })
})

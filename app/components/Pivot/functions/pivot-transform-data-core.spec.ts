import { describe, expect, it } from 'vitest'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import { pivotTransformDataCore } from './pivot-transform-data-core'

const data = [
  { center: 'Frigo', month: '2026-01', revenue: 100, cost: 40 },
  { center: 'Frigo', month: '2026-02', revenue: 200, cost: 80 },
  { center: 'Bakery', month: '2026-01', revenue: 50, cost: 30 },
]

const rows = [{ field: 'center' as const, dataType: 'string' as const, minWidth: 100, width: '120px', widthResolved: '120px', resizable: true }]
const columns = [{ field: 'month' as const }]
const values = [
  { field: 'revenue' as const, summaryType: SummaryEnum.SUM, widthResolved: '80px', _label: 'Revenue' },
  { field: 'cost' as const, summaryType: SummaryEnum.SUM, widthResolved: '80px', _label: 'Cost' },
]

describe('pivotTransformDataCore valuesOnRows', () => {
  it('default: multiplies columns by measure count', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: false })
    const monthCols = result.valueColumns.filter(c => !c.isGrandTotal)
    expect(monthCols).toHaveLength(4)
  })

  it('valuesOnRows: one column per month + grand total', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const monthCols = result.valueColumns.filter(c => !c.isGrandTotal)
    expect(monthCols).toHaveLength(2)
    expect(result.valueHeaderRows).toHaveLength(1)
  })

  it('valuesOnRows: fans out 2 measure rows per center leaf', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const frigoRows = result.data.filter(r => r.groupPath[0] === 'Frigo' && r.rowItem.kind === 'data')
    expect(frigoRows).toHaveLength(2)
    expect(frigoRows[0]?.activeValueField).toBe('revenue')
    expect(frigoRows[1]?.activeValueField).toBe('cost')
  })

  it('valuesOnRows: adds valueLabel cell with measure name', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const row = result.data.find(r => r.groupPath[0] === 'Frigo' && r.activeValueField === 'revenue')
    const labelCell = row?.rowItem.cells.find(c => c.kind === 'valueLabel')
    expect(labelCell?.label).toBe('Revenue')
  })

  it('valuesOnRows: aggregates correct measure per row', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const row = result.data.find(r => r.groupPath[0] === 'Frigo' && r.activeValueField === 'revenue')
    const janCell = row?.valueItem.cells.find(c => c.columnPath[0] === '2026-01')
    expect(janCell?.aggregated).toBe(100)
  })

  it('valuesOnRows: grand total fans out per measure', () => {
    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const gtRows = result.data.filter(r => r.rowItem.kind === 'grandTotal')
    expect(gtRows).toHaveLength(2)
  })

  it('valuesOnRows: survives moving column field to rows and back', () => {
    const monthRowField = { field: 'month' as const, dataType: 'string' as const, minWidth: 100, width: '100px', widthResolved: '100px', resizable: true }

    pivotTransformDataCore({
      data,
      rows: [...rows, monthRowField],
      columns: [],
      values,
      valuesOnRows: true,
    })

    const result = pivotTransformDataCore({ data, rows, columns, values, valuesOnRows: true })
    const frigoRows = result.data.filter(r => r.groupPath[0] === 'Frigo' && r.rowItem.kind === 'data')

    expect(frigoRows).toHaveLength(2)
    expect(frigoRows.every(row => row.rowItem.cells.some(cell => cell.kind === 'valueLabel'))).toBe(true)
    expect(result.valueColumns.filter(column => !column.isGrandTotal)).toHaveLength(2)
  })
})

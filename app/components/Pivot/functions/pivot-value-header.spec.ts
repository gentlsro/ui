import { describe, expect, it } from 'vitest'
import { buildPivotValueColumns } from './pivot-build-value-columns'
import { buildVisiblePivotValueColumns } from './pivot-column-collapse'
import type { IPivotTransformValueField } from './pivot-transform-data-core'

/**
 * The value header of a pivot without a column dimension (a list of regions with revenue and orders). Failure modes
 * written before the fix:
 *  H1 each value column's header is a row of its own: the labels stack down the first column (Revenue / Orders /
 *     Grand Total / Grand Total) and the other columns have no header;
 *  H2 a grand-total column repeats each measure: without column groups a row's value is its total already, so the
 *     pivot shows every figure twice under two "Grand Total" headers;
 *  H3 with a column dimension the grand totals go missing (they sum the column groups there).
 */

type Row = { region: string, year: string, revenue: number, orders: number }

const value = (field: 'revenue' | 'orders', label: string): IPivotTransformValueField<Row> => ({ measureId: field, field, summaryType: 'SUM' as never, widthResolved: '120px', _label: label })
const values = [value('revenue', 'Revenue'), value('orders', 'Orders')]
const data: Row[] = [{ region: 'South', year: '2025', revenue: 10, orders: 1 }, { region: 'North', year: '2026', revenue: 7, orders: 2 }]

describe('the value header without a column dimension', () => {
  const built = buildPivotValueColumns({ data, columnFields: [], valueFields: values })
  const visible = buildVisiblePivotValueColumns({ columnFields: [], valueFields: values, tree: [], collapsedColumnGroupIds: new Set(), allValueColumns: built.valueColumns })

  it('is one row with a cell per value column (H1)', () => {
    for (const layout of [built, visible]) {
      expect(layout.valueHeaderRows).toHaveLength(1)
      expect(layout.valueHeaderRows[0]!.map(cell => cell.label)).toEqual(['Revenue', 'Orders'])
    }
  })

  it('shows each measure once, with no grand total repeating it (H2)', () => {
    expect(built.valueColumns.map(column => column.label)).toEqual(['Revenue', 'Orders'])
    expect(visible.valueColumns.every(column => !column.isGrandTotal)).toBe(true)
  })
})

describe('the value header with a column dimension', () => {
  it('keeps a grand total per measure (H3)', () => {
    const built = buildPivotValueColumns({ data, columnFields: [{ field: 'year' }], valueFields: values })
    expect(built.valueColumns.filter(column => column.isGrandTotal).map(column => column.measureId)).toEqual(['revenue', 'orders'])
  })
})

import { beforeAll, describe, expect, it, vi } from 'vitest'
import type * as TransformModule from './pivot-transform-data-core'
import type * as ColumnCollapseModule from './pivot-column-collapse'
import type * as RowCellModule from './pivot-resolve-row-item-cell'

/**
 * Total labels are translated: the grand total label reaches the worker as a string (column and header labels),
 * the subtotal label is formatted on the main thread (its word order depends on the language)
 */

let transform: typeof TransformModule
let columnCollapse: typeof ColumnCollapseModule
let rowCell: typeof RowCellModule

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', { SUM: 'SUM', COUNT: 'COUNT', AVERAGE: 'AVERAGE', MEDIAN: 'MEDIAN' })
  transform = await import('./pivot-transform-data-core')
  columnCollapse = await import('./pivot-column-collapse')
  rowCell = await import('./pivot-resolve-row-item-cell')
})

const CZECH = {
  grandTotal: 'Celkový součet',
  subtotal: (label: string) => `${label} celkem`,
}

const values = [
  { measureId: 'sum', field: 'amount', summaryType: 'SUM', widthResolved: '1px', _label: 'Součet', item: { _label: 'Součet' } },
  { measureId: 'count', field: 'amount', summaryType: 'COUNT', widthResolved: '1px', _label: 'Počet', item: { _label: 'Počet' } },
] as any[]
const rowFields = [
  { field: 'region', dataType: 'string', minWidth: 1, width: '1px', widthResolved: '1px', resizable: true },
  { field: 'city', dataType: 'string', minWidth: 1, width: '1px', widthResolved: '1px', resizable: true },
] as any[]
const data = [{ region: 'Morava', city: 'Brno', year: '2024', amount: 1 }]

function resolveRowLabel(kind: 'grandTotal' | 'subtotal', labels?: typeof CZECH) {
  return rowCell.resolvePivotRowItemCell({
    item: { id: 'cell', kind, rowFieldIndex: 0, row: rowFields[0], groupId: '0:Morava', ref: data[0] } as any,
    groupIds: ['0:Morava'],
    groupPath: ['Morava'],
    promotedLevels: [],
    rows: rowFields,
    collapsedGroupIds: new Set(),
    localeIso: 'cs-CZ',
    formatCellValue: ({ value }) => value,
    labels,
  }).displayValue
}

describe('pivot total labels', () => {
  it('labels total rows with the supplied translations', () => {
    expect(resolveRowLabel('grandTotal', CZECH)).toBe('Celkový součet')
    expect(resolveRowLabel('subtotal', CZECH)).toBe('Morava celkem')
  })

  it('keeps the English labels without translations', () => {
    expect(resolveRowLabel('grandTotal')).toBe('Grand Total')
    expect(resolveRowLabel('subtotal')).toBe('Morava Total')
  })

  it('labels the grand total value columns built by the transform', () => {
    const result = transform.pivotTransformDataCore({
      data,
      rows: rowFields,
      columns: [{ field: 'year' }],
      values,
      grandTotalLabel: CZECH.grandTotal,
    } as any)
    const grandTotalColumns = result.valueColumns.filter(column => column.isGrandTotal)

    expect(grandTotalColumns.map(column => column.label)).toEqual(['Celkový součet / Součet', 'Celkový součet / Počet'])
    expect(result.valueHeaderRows.flat().filter(cell => cell.id.startsWith('header:grand-total')).map(cell => cell.label))
      .toEqual(['Celkový součet', 'Součet', 'Počet'])
  })

  it('labels the grand total of the visible header and columns', () => {
    const result = transform.pivotTransformDataCore({ data, rows: rowFields, columns: [{ field: 'year' }], values } as any)
    const visible = columnCollapse.buildVisiblePivotValueColumns({
      columnFields: [{ field: 'year' }] as any,
      valueFields: values,
      tree: result.columnTree,
      collapsedColumnGroupIds: new Set(),
      allValueColumns: result.valueColumns,
      grandTotalLabel: CZECH.grandTotal,
    })

    expect(visible.valueColumns.filter(column => column.isGrandTotal).map(column => column.label))
      .toEqual(['Celkový součet / Součet', 'Celkový součet / Počet'])
    expect(visible.valueHeaderRows[0]!.at(-1)?.label).toBe('Celkový součet')
  })

  it('labels the grand total header without column fields', () => {
    const result = transform.pivotTransformDataCore({
      data,
      rows: rowFields,
      columns: [],
      values: [values[0]],
      grandTotalLabel: CZECH.grandTotal,
    } as any)
    const visible = columnCollapse.buildVisiblePivotValueColumns({
      columnFields: [],
      valueFields: [values[0]],
      tree: result.columnTree,
      collapsedColumnGroupIds: new Set(),
      allValueColumns: result.valueColumns,
      grandTotalLabel: CZECH.grandTotal,
    })

    expect(visible.valueHeaderRows.flat().map(cell => cell.label)).toEqual(['Součet', 'Celkový součet'])
  })
})

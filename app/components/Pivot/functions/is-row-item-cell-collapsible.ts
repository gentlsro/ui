// Types
import type { IPivotRowItemCell } from '../types/pivot-row-item-cell.type'

// Models
import type { PivotRow } from '../models/pivot-row.model'

export function isRowItemCellCollapsible(payload: {
  rows: PivotRow[]
  item: Pick<IPivotRowItemCell, 'kind' | 'rowFieldIndex'>
}) {
  const { rows, item } = payload

  if (item.kind !== 'rowLabel') {
    return false
  }

  const lastRowFieldIndex = Math.max(rows.length - 1, 0)

  return item.rowFieldIndex !== undefined
    && item.rowFieldIndex < lastRowFieldIndex
}

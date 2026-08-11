// Types
import type { IPivotRowItemCell } from '../types/pivot-row-item-cell.type'

// Models
import type { PivotItem } from '../models/pivot-item.model'

export function isRowItemCellCollapsible<T extends IItem>(payload: {
  rows: PivotItem<T>[]
  item: Pick<IPivotRowItemCell<T>, 'kind' | 'rowFieldIndex'>
}) {
  const { rows, item } = payload

  if (item.kind !== 'rowLabel') {
    return false
  }

  const lastRowFieldIndex = Math.max(rows.length - 1, 0)

  return item.rowFieldIndex !== undefined
    && item.rowFieldIndex < lastRowFieldIndex
}

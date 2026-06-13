// Types
import type { IPivotRowItemCell } from './pivot-row-item-cell.type'

export type PivotRowItemKind = 'data' | 'subtotal' | 'grandTotal' | 'emptyRow'

export type IPivotRowItem<T = IItem> = {
  id: string
  label: string
  kind?: PivotRowItemKind

  cells: IPivotRowItemCell<T>[]
}

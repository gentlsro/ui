import type { PivotItem } from '../models/pivot-item.model'

export type PivotRowItemCellKind = 'rowLabel' | 'subtotal' | 'grandTotal' | 'empty' | 'valueLabel'

export type IPivotRowItemCell<T = IItem> = {
  id: string
  kind?: PivotRowItemCellKind
  rowFieldIndex?: number
  row?: PivotItem<T>
  groupId: string
  label?: string

  ref: T
}

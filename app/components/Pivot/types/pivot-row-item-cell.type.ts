import type { PivotRow } from '../models/pivot-row.model'

export type PivotRowItemCellKind = 'rowLabel' | 'subtotal' | 'grandTotal' | 'empty'

export type IPivotRowItemCell<T = IItem> = {
  id: string
  kind?: PivotRowItemCellKind
  rowFieldIndex?: number
  row?: PivotRow<T>
  groupId: string

  ref: T
}

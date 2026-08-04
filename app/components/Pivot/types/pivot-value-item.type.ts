import type { IPivotValueItemCell } from './pivot-value-item-cell.type'
import type { PivotRowItemKind } from './pivot-row-item.type'

export type IPivotValueItem<T = IItem> = {
  id: string
  kind?: PivotRowItemKind
  groupIds: string[]
  cells: IPivotValueItemCell<T>[]
  columnGroupCells?: Record<string, IPivotValueItemCell<T>>
  collapsedGroupValueItems?: Record<string, IPivotValueItem<T>>
}

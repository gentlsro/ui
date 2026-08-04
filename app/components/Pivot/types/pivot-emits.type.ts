import type { IPivotDataItem } from './pivot-data-item.type'
import type { IPivotValueColumnItem } from './pivot-value-column-item.type'
import type { IPivotValueItemCell } from './pivot-value-item-cell.type'

export type IPivotInteractionEvent = MouseEvent | KeyboardEvent

export type IPivotRowClickPayload<T = IItem> = {
  ev: IPivotInteractionEvent
  row: IPivotDataItem<T>
}

export type IPivotCellClickPayload<T = IItem> = IPivotRowClickPayload<T> & {
  cell: IPivotValueItemCell<T>
  column: IPivotValueColumnItem<T>
}

export type IPivotEmitFncs<T = IItem> = {
  rowClick: (payload: IPivotRowClickPayload<T>) => void
  cellClick: (payload: IPivotCellClickPayload<T>) => void
}

export type IPivotEmits<T = IItem> = {
  (e: 'click:row', payload: IPivotRowClickPayload<T>): void
  (e: 'click:cell', payload: IPivotCellClickPayload<T>): void
}

// Types
import type { DragEndFnc } from './drag-end-fnc.type'
import type { IDraggedItem } from './dragged-item.type'

export type IDragAndDropProps<T = IItem> = {
  direction?: 'horizontal' | 'vertical'
  group?: string
  items?: T[]
  noDrop?: boolean
  parent?: IItem
  itemKey?: ObjectKey<T> | ((item: T) => ObjectKey<T>)

  onDragStart?: (item: IDraggedItem<T>) => void
  canDrop?: (item: IDraggedItem<T>) => boolean
  onDragEnd?: DragEndFnc<T>
}

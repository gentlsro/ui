// Types
import type { IDndState } from './drag-and-drop-state.type'

/**
 * We can prevent the drag if we return `true` from this function.
 */
export type DragStartFnc<T = IItem> = (payload: {
  el: HTMLElement
  item: T
  dndState: IDndState
  event: MouseEvent | TouchEvent
}) => boolean | void

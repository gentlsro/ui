import type { CSSProperties } from 'vue'

// Types
import type { IListItem } from './list-item.type'
import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

export type IListDragMeta = {
  /**
   * Source item element (to get the actual source item, you can use the `draggedItem` from store)
   */
  sourceEl?: HTMLElement

  /**
   * The source item rect
   */
  sourceRect?: DOMRect

  /**
   * The taget item element
   */
  targetEl?: HTMLElement

  /**
   * The target item
   */
  target?: IListItem | IGroupRow

  /**
   * Placement of the indicator - above or below the target item
   */
  placement?: 'above' | 'below' | 'left' | 'right'

  /**
   * The CSS properties to apply to the drop indicator
   */
  dropIndicatorCSS?: CSSProperties

  /**
   * If virtual scroll is active (~ there is enough data in the list), we use
   * use the drop indicator instead of animating the changes immediately
   */
  isVirtualScroll?: boolean
}

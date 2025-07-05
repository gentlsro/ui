import type { CSSProperties } from 'vue'

export type ITreeDragMeta<T extends IItem = IItem> = {
  /**
   * The source item element (to get the actual source item, you can use the `draggedNode` from store)
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
  target?: ITreeNode<T> | { id: '__ROOT__' } | null

  /**
   * Placement of the indicator - above or below the target item
   */
  placement?: 'above' | 'below' | 'left' | 'right'

  /**
   * The CSS properties to apply to the drop indicator
   */
  dropIndicatorCSS?: CSSProperties

  /**
   * Whether the drop is allowed
   */
  dropAllowed?: boolean
}

import type { CSSProperties } from 'vue'
import type { VirtualizerOptions } from '@tanstack/vue-virtual'

// Constants
import type { VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS } from '../constants/virtual-scroller-vertical-default-props'

export type IVirtualScrollerVerticalProps<T extends IItem = IItem> = {
  /**
   * The data rows
   */
  rows: T[]

  /**
   * The height of each row
   *
   * NOTE: This acts as the minimum height - if the row content is taller,
   * the row will be adjusted automatically.
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: keyof T

  /**
   * Row indices that stick to the top while scrolling.
   *
   * Typically group headers. The active sticky row updates as you scroll.
   *
   * @see https://tanstack.com/virtual/latest/docs/framework/vue/examples/sticky
   */
  stickyIndices?: number[]

  /**
   * The options to pass to the virtualizer
   *
   * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
   */
  virtualizerOptions?: Partial<Pick<
    VirtualizerOptions<HTMLDivElement, HTMLDivElement>,
  'overscan' | 'scrollMargin' | 'getScrollElement'
  >>

  ui?: {
    /**
     * Class applied to the row
     */
    rowClass?: (payload: {
      defaults: ReturnType<typeof VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS['ui']['rowClass']>
    }) => ClassType

    /**
     * Style applied to the row
     */
    rowStyle?: () => CSSProperties
  }
}

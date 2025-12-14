import type { CSSProperties } from 'vue'

// Constants
import type { VIRTUAL_SCROLLER_DEFAULT_PROPS } from '../constants/virtual-scroller-default-props'

export type IVirtualScrollerProps<T> = {
  /**
   * The number of rows to render initially
   */
  initialRowsRenderCount?: number

  /**
   * When adding more rows to the virtual scroller, this must be set to true
   * to not override calculated heights
   *
   * Note: This is only relevant for dynamic row heights
   */
  fetchMore?: boolean

  /**
   * When true, the component will NOT emit scroll events (performance)
   */
  noScrollEmit?: boolean

  /**
   * The overscan (in pixels) for both top and bottom directions
   */
  overscan?: { top?: number, bottom?: number }

  /**
   * The data rows
   */
  rows?: T[]

  /**
   * The height of each row
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: keyof T

  /**
   * The threshold for amount of items for virtual scroller to kick in, otherwise it will be
   * a regular div with scroll
   */
  threshold?: number

  /**
   * Watch for width changes
   */
  watchWidth?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class applied to the row
     */
    rowClass?: (payload: {
      defaults: ReturnType<typeof VIRTUAL_SCROLLER_DEFAULT_PROPS['ui']['rowClass']>
    }) => ClassType

    /**
     * Style applied to the row
     */
    rowStyle?: () => CSSProperties
  }
}

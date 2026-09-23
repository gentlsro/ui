import type { CSSProperties } from 'vue'
import type { TableColumn } from '../../Table/models/table-column.model'

// Constants
import type { VIRTUAL_SCROLLER_DEFAULT_PROPS } from '../constants/virtual-scroller-default-props'

export type IVirtualScrollerProps<T> = {
  /** Columns available to the row slot and optional horizontal virtualization. */
  columns?: TableColumn<T>[]

  /** Virtualize columns as well as rows. Defaults to false. */
  virtualizeColumns?: boolean

  /**
   * The number of rows to render during SSR, using TanStack initialRect.
   * The actual viewport is observed after mount.
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
     * Class applied to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof VIRTUAL_SCROLLER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style applied to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class applied to the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof VIRTUAL_SCROLLER_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style applied to the content
     */
    contentStyle?: () => CSSProperties

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

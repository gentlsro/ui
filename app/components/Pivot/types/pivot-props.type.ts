import type { CSSProperties } from 'vue'

// Store
import type { usePivotStore } from '../stores/pivot.store'

// Constants
import type { PIVOT_DEFAULT_PROPS } from '../constants/pivot-default-props.constant'

export type IPivotProps<T = IItem> = {
  /**
   * Explicitly provided data
   */
  data?: T[]

  /**
   * Pivot rows
   */
  rows?: PivotRow[]

  /**
   * Pivot columns
   */
  columns?: PivotColumn[]

  /**
   * Pivot values
   */
  values?: PivotValue[]

  /**
   * Pivot filters
   */
  filters?: PivotFilter[]

  /**
   * Pivot configuration
   */
  config?: {
    /**
     * Whether to use an empty row between pivot rows
     */
    useEmptyRow?: boolean
  }

  collapseConfig?: {
    /**
     * Expanded level on init
     *
     * For example, if set to 1, the first level of nodes will be expanded on init
     *
     * @default 0 (no levels expanded on init)
     */
    expandedLevelOnInit?: number
  }

  /**
   * Minimum width of a row column in px
   */
  minimumColumnWidth?: number

  /**
   * Load data configuration
   */
  loadData?: {
    /**
     * The key to use for the items from the server response
     */
    payloadKey?: string

    /**
     * The key to use for the total count of items from the server response
     */
    countKey?: string

    /**
     * The function to use for fetching the data
     */
    fnc?: (payload: {
      getStore: () => any // This is a workaround to avoid the circular reference
    }) => any | Promise<any>

    /**
     * Whether to fetch data immediately (= this will use `await` to fetch the data)
     */
    immediate?: boolean

    /**
     * A function that gets called when the data is fetched
     * You can use this to modify to response to map the data or whatever
     */
    onFetch?: (payload: {
      res: any
      getStore: () => any // This is a workaround to avoid the circular reference
    }) => any
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Class to apply to the header
     */
    headerClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['headerClass']>
    }) => ClassType

    /**
     * Style to apply to the header
     */
    headerStyle?: () => CSSProperties

    /**
     * Class to apply to the row header
     */
    rowHeaderClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowHeaderClass']>
    }) => ClassType

    /**
     * Style to apply to the row header
     */
    rowHeaderStyle?: () => CSSProperties

    /**
     * Class to apply to the row header cell
     */
    rowHeaderCellClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowHeaderCellClass']>
    }) => ClassType

    /**
     * Style to apply to the row header cell
     */
    rowHeaderCellStyle?: () => CSSProperties

    /**
     * Style to apply to the content
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the row item
     */
    rowItemClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowItemClass']>
    }) => ClassType

    /**
     * Style to apply to the row item
     */
    rowItemStyle?: () => CSSProperties

    /**
     * Class to apply to the row item cell
     */
    rowItemCellClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowItemCellClass']>
    }) => ClassType

    /**
     * Style to apply to the row item cell
     */
    rowItemCellStyle?: () => CSSProperties

    /**
     * Class to apply to the value header
     */
    valueHeaderClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['valueHeaderClass']>
    }) => ClassType

    /**
     * Style to apply to the value header
     */
    valueHeaderStyle?: () => CSSProperties

    /**
     * Class to apply to the value header cell
     */
    valueHeaderCellClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['valueHeaderCellClass']>
    }) => ClassType

    /**
     * Style to apply to the value header cell
     */
    valueHeaderCellStyle?: () => CSSProperties

    /**
     * Class to apply to the value item
     */
    valueItemClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['valueItemClass']>
    }) => ClassType

    /**
     * Style to apply to the value item
     */
    valueItemStyle?: () => CSSProperties

    /**
     * Class to apply to the value item cell
     */
    valueItemCellClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['valueItemCellClass']>
    }) => ClassType

    /**
     * Style to apply to the value item cell
     */
    valueItemCellStyle?: () => CSSProperties

    /**
     * Class to apply to the values virtual scroller
     */
    valuesScrollerClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['valuesScrollerClass']>
    }) => ClassType

    /**
     * Class to apply to the rows wrapper
     *
     * This wrapper is primarily here to overcome issues with scrollbars
     */
    rowsWrapperClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowsWrapperClass']>
    }) => ClassType

    /**
     * Class to apply to the rows virtual scroller
     */
    rowsScrollerClass?: (payload: {
      defaults: ReturnType<typeof PIVOT_DEFAULT_PROPS['ui']['rowsScrollerClass']>
    }) => ClassType
  }
}

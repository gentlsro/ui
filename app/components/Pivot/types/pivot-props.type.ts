import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Store
import type { usePivotStore } from '../stores/pivot.store'

// Constants
import type { PivotItem } from '../models/pivot-item.model'
import type { IPivotPerformanceConfig } from '../constants/pivot-performance.constant'

export type IPivotProps<T = IItem> = {
  /**
   * Whether row headers emit click:row interactions
   */
  rowClickable?: boolean

  /**
   * Whether value cells emit click:cell interactions
   */
  cellClickable?: boolean

  /**
   * The title of the pivot
   */
  title?: string | (() => string)

  /**
   * Explicitly provided data
   */
  data?: T[]

  /**
   * Pivot items
   */
  items?: PivotItem<T>[]

  /**
   * Pivot configuration
   */
  config?: {
    /**
     * Whether to use an empty row between pivot rows
     */
    useEmptyRow?: boolean

    /**
     * Width of the left panel in px
     */
    leftPanelWidth?: string

    /**
     * Show value measures as rows instead of columns (Power BI "Show values on rows")
     */
    valuesOnRows?: boolean

    /**
     * Width of the synthetic measure label column
     */
    measureColumnWidth?: string
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
   * Client-side transform warning thresholds
   */
  performance?: IPivotPerformanceConfig

  /**
   * Set the `loading` state manually
   */
  loading?: boolean

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
      defaults: UIClassPicker<UIResolvedClasses['pivot']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['contentClass']>
    }) => ClassType

    /**
     * Class to apply to the top area
     */
    topClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['topClass']>
    }) => ClassType

    /**
     * Style to apply to the top area
     */
    topStyle?: () => CSSProperties

    /**
     * Class to apply to the header
     */
    headerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['headerClass']>
    }) => ClassType

    /**
     * Style to apply to the header
     */
    headerStyle?: () => CSSProperties

    /**
     * Class to apply to the title
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the column filters area
     */
    columnFiltersClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['columnFiltersClass']>
    }) => ClassType

    /**
     * Style to apply to the column filters area
     */
    columnFiltersStyle?: () => CSSProperties

    /**
     * Class to apply to the filters area
     */
    filtersClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['filtersClass']>
    }) => ClassType

    /**
     * Style to apply to the filters area
     */
    filtersStyle?: () => CSSProperties

    /**
     * Class to apply to the row header
     */
    rowHeaderClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowHeaderClass']>
    }) => ClassType

    /**
     * Style to apply to the row header
     */
    rowHeaderStyle?: () => CSSProperties

    /**
     * Class to apply to the row header cell
     */
    rowHeaderCellClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowHeaderCellClass']>
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
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowItemClass']>
    }) => ClassType

    /**
     * Style to apply to the row item
     */
    rowItemStyle?: () => CSSProperties

    /**
     * Class to apply to the row item cell
     */
    rowItemCellClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowItemCellClass']>
    }) => ClassType

    /**
     * Style to apply to the row item cell
     */
    rowItemCellStyle?: () => CSSProperties

    /**
     * Class to apply to the value header
     */
    valueHeaderClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['valueHeaderClass']>
    }) => ClassType

    /**
     * Style to apply to the value header
     */
    valueHeaderStyle?: () => CSSProperties

    /**
     * Class to apply to the value header cell
     */
    valueHeaderCellClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['valueHeaderCellClass']>
    }) => ClassType

    /**
     * Style to apply to the value header cell
     */
    valueHeaderCellStyle?: () => CSSProperties

    /**
     * Class to apply to the value item
     */
    valueItemClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['valueItemClass']>
    }) => ClassType

    /**
     * Style to apply to the value item
     */
    valueItemStyle?: () => CSSProperties

    /**
     * Class to apply to the value item cell
     */
    valueItemCellClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['valueItemCellClass']>
    }) => ClassType

    /**
     * Style to apply to the value item cell
     */
    valueItemCellStyle?: () => CSSProperties

    /**
     * Class to apply to the values virtual scroller
     */
    valuesScrollerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['valuesScrollerClass']>
    }) => ClassType

    /**
     * Class to apply to the rows wrapper
     *
     * This wrapper is primarily here to overcome issues with scrollbars
     */
    rowsWrapperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowsWrapperClass']>
    }) => ClassType

    /**
     * Class to apply to the rows virtual scroller
     */
    rowsScrollerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['rowsScrollerClass']>
    }) => ClassType

    /**
     * Class to apply to the loading area
     */
    loadingClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pivot']['loadingClass']>
    }) => ClassType

    /**
     * Style to apply to the loading area
     */
    loadingStyle?: () => CSSProperties
  }
}

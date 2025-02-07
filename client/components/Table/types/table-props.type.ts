import type { CSSProperties } from 'vue'
import type { RouteLocationRaw } from '#vue-router'

// Types
import type { TableFeature } from './table-feature.type'
import type { ISelection } from '../../../types/selection.type'
import type { ITableFetchPayload } from './table-fetch-payload.type'
import type { IQueryBuilderProps } from '../../QueryBuilder/types/query-builder-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import type { tableNavigate } from '../functions/table-navigate'
import type { tableExtractSortingFromUrl } from '../functions/table-extract-sorting-from-url'
import type { tableExtractFiltersFromUrl } from '../functions/table-extract-filters-from-url'
import type { tableExtractSelectedColumnsFromUrl } from '../functions/table-extract-selected-columns-from-url'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'
import type { tableSerializeSorting } from '../functions/table-serialize-sorting'
import type { tableSerializeFilters } from '../functions/table-serialize-filters'
import type { tableSerializeSelect } from '../functions/table-serialize-select'
import type { tableBuildFetchPayload } from '../functions/table-build-fetch-payload'
import type { tableBuildQueryParams } from '../functions/table-build-query-params'
import type { tableExportData } from '../functions/table-export-data'
import type { tableSaveLayout } from '../functions/table-save-layout'
import type { tableDeleteLayout } from '../functions/table-delete-layout'
import type { tableFilterValueChangeDebounce } from '../functions/table-filter-value-change-debounce'

// Store
import type { useTableStore } from '../stores/table.store'
import type { tableExtractPaginationFromUrl } from '../functions/table-extract-pagination-from-url'
import type { tableSerializePagination } from '../functions/table-serialize-pagination'
import type { tableGetLayoutMeta } from '../functions/table-get-layout-meta'

export type ITableProps<
  K extends typeof tableBuildFetchPayload = typeof tableBuildFetchPayload,
> = {
  /**
   * Whether multiple filters of the same comparator can be used within field filter
   */
  allowComparatorsOfSameType?: boolean

  /**
   * When true, the table content (header + content) will have a border
   */
  bordered?: boolean

  /**
   * The breakpoint at which the table should switch to mobile view
   */
  breakpoint?: number

  /**
   * Definition of the table columns
   */
  columns?: TableColumn<any>[]

  /**
   * Whether the table is editable
   *
   * You can also provide the `view` property to specify in which view the table
   * should be editable
   */
  editable?: boolean | { view: 'card' | 'row' }

  /**
   * A value that is used for comparators like `ComparatorEnum.IS_EMPTY`
   */
  emptyValue?: any

  /**
   * A list of features that should be enabled within the table
   */
  features?: TableFeature[]

  /**
   * Whether the row should be clickable
   */
  rowClickable?: boolean

  /**
   * The default key for the table rows
   * @default 'id'
   */
  rowKey?: string

  /**
   * The data (rows) of the table
   */
  rows?: IItem[]

  /**
   * Autofit configuration
   */
  autoFit?: {
    /**
     * Whether to autofit the columns on initialization
     */
    onInit?: boolean

    /**
     * The mode to use for the autofit
     */
    mode?: 'justify' | 'stretch' | 'fit'

    /**
     * The number of rows to consider when calculating the autofit
     */
    rowsLimit?: number

    /**
     * Whether to consider the header when calculating the autofit
     */
    considerHeader?: boolean

    /**
     * The maximum width of the column in characters
     */
    maxColumnWidthChars?: number
  }

  /**
   * Initial schema for the table, if this is used, it takes priority over everything,
   * even the URL
   */
  initialSchema?: string | URLSearchParams

  /**
   * Load data configuration
   */
  loadData?: {
    /**
     * The function to use for fetching the data
     */
    fnc?: (payload: ITableFetchPayload<K>) => any | Promise<any>

    /**
     * The key to use for the items from the server response
     */
    payloadKey?: string

    /**
     * The key to use for the total count of items from the server response
     */
    countKey?: string

    /**
     * When true, the `loadData` fnc will be called immediately on initialization
     * even if there are rows provided through the `rows` prop
     */
    immediate?: boolean

    /**
     * The function that handles the response in case of an error
     */
    onError?: (error: any) => void

    /**
     * A function that gets called when the metadata is fetched
     * You can use this to modify to response to map the data or whatever
     */
    onFetch?: (res: any) => IItem
  }

  /**
   * Whether the table is loading
   */
  loading?: boolean

  /**
   * Configuration for loading the metadata
   */
  loadMetaData?: {
    /**
     * The function to get the metadata
     */
    fnc?: (payload: {
      tablePayload: ITableFetchPayload<K>
      getStore: () => ReturnType<typeof useTableStore>
    }) => any | Promise<any>

    /**
     * The key in the response that contains the columns
     */
    columnsKey?: string

    /**
     * The key in the response that contains the default layout
     */
    defaultLayoutKey?: string

    /**
     * The key in the response that contains the layouts
     */
    layoutsKey?: string

    // /**
    //  * When true, if metadata returns columns, they all will be used, no matter
    //  * if we defined just some of them explcitly in the `columns` prop
    //  */
    // useAllColumns?: boolean

    /**
     * The function that handles the response in case of an error
     */
    onError?: (error: any) => void

    /**
     * A function that gets called when the metadata is fetched
     * You can use this to modify to response to map the data or whatever
     *
     * NOTE: This gets called before the extraction of data (like `columnsKey`, `layoutsKey`, etc.)
     * NOTE 2: You can return a special property `_preventFetchData`. If you set this to `true`,
     * the data `loadData.fnc` will not be called after the metadata is fetched.
     *
     * Use-case: if your `loadMetaData.fnc` also returns the actual data, you can manually
     * set the `rows` and whatever data in the store you want, and prevent the data from being fetched again
     */
    onFetch?: (payload: {
      res: any
      getStore: () => ReturnType<typeof useTableStore>
    }
    ) => IItem & { _preventFetchData?: boolean }
  }

  /**
   * The minimum width of the columns in px (does not apply to `helper` columns)
   */
  minimumColumnWidth?: number

  /**
   * Modifiers are a set of functions that are used to modify the behaviour of the table
   */
  modifiers?: {
    /**
     * When true, the table will primarily use the URL to get the proper structure
     * of columns, filters, sorting, etc.
     */
    useUrl?: boolean

    /**
     * When true, the column names will be case insensitive
     */
    caseInsensitive?: boolean

    /**
     * Function that extracts the sorting from the URL
     */
    extractSortingFromUrl?: typeof tableExtractSortingFromUrl

    /**
     * Function that extracts the filters from the URL
     */
    extractFiltersFromUrl?: typeof tableExtractFiltersFromUrl

    /**
     * Function that extracts the selected columns from the URL
     */
    extractSelectedColumnsFromUrl?: typeof tableExtractSelectedColumnsFromUrl

    /**
     * Function that extracts the pagination from the URL
     */
    extractPaginationFromUrl?: typeof tableExtractPaginationFromUrl

    /**
     * Function that serializes the sorting from the internal structure to the URL
     */
    serializeSorting?: typeof tableSerializeSorting

    /**
     * Function that serializes the filters from the internal structure to the URL
     */
    serializeFilters?: typeof tableSerializeFilters

    /**
     * Function that serializes the selected columns from the internal structure to the URL
     */
    serializeSelectedColumns?: typeof tableSerializeSelect

    /**
     * Function that serializes the pagination from the internal structure to the URL
     */
    serializePagination?: typeof tableSerializePagination

    /**
     * Function that exports the table data to a file
     */
    exportData?: typeof tableExportData

    /**
     * Function that saves the table layout
     *
     * Default implementation will save it into the local storage
     */
    saveLayout?: typeof tableSaveLayout

    /**
     * Function that deletes the table layout
     *
     * Default implementation will delete it from the local storage
     */
    deleteLayout?: typeof tableDeleteLayout

    /**
     * Function that builds the URL query params from the serialized data
     */
    buildParams?: typeof tableBuildQueryParams

    /**
     * Function that returns the debounce time for the filter value change
     *
     * This can be used to avoid too many requests to the server when user is
     * modifying the filter value
     */
    filterValueChangeDebounce?: typeof tableFilterValueChangeDebounce

    /**
     * Function that builds the payload for the fetch
     */
    buildFetchPayload?: K

    /**
     * Function that navigates to URL based on the table state
     */
    navigate?: typeof tableNavigate

    /**
     * Function that determines what parts have been saved within the layout, like
     * columns, filters, sorting, etc.
     */
    getLayoutMeta?: typeof tableGetLayoutMeta
  }

  /**
   * When true, the header will not be shown
   */
  noHeader?: boolean

  /**
   * When true, the table will not use the saved state to restore the table
   */
  noState?: boolean

  /**
   * Pagination configuration
   */
  paginationConfig?: {
    /**
     * Whether pagination is enabled
     *
     * NOTE: If pagination is disabled, it is assumed that we're using infinite scroll
     */
    enabled?: boolean

    /**
     * The number of rows to show per page
     */
    pageSize?: number

    /**
     * The options to choose from regarding `pageSize`
     */
    options?: number[]
  }

  /**
   * Query builder items
   */
  queryBuilder?: IQueryBuilderRow[]

  /**
   * The props that should be passed to the QueryBuilder
   */
  queryBuilderProps?: Partial<IQueryBuilderProps>

  /**
   * The maximum number of rows to load
   */
  rowsLimit?: number

  /**
   * The search query
   */
  search?: string

  /**
   * The selected rows
   */
  selection?: ISelection

  /**
   * Selection configuration
   */
  selectionConfig?: {
    /**
     * Whether the table rows should be selectable
     */
    enabled?: boolean

    /**
     * If true, when item is selected, only the `itemKey` will be emitted, not
     * the whole item
     */
    emitKey?: boolean

    /**
     * Function that gets called on row select, returrn `false` to prevent the
     * selection from happening
     */
    onSelect?: (
      row: any,
      selection: MaybeRefOrGetter<ISelection>,
    ) => void | false | Promise<void | false>

    /**
     * Selection key
     * The key to use for the selection, defaults to table's `rowKey`
     */
    selectionKey?: string

    /**
     * Whether given table row have the selection disabled
     */
    disabled?: ((row: any) => boolean)

    /**
     * Whether the selection is multi-select
     */
    multi?: boolean
  }

  /**
   * Whether to show separators between the rows and columns
   */
  separator?: 'horizontal' | 'vertical' | 'cell'

  /**
   * Split rows configuration
   *
   * You can use this to split the rows into multiple columns
   * If a breakpoint uses a number > 1, it will automatically switch to the card view
   *
   * Example: [
   *  { breakpoint: 600, count: 2 },
   *  { breakpoint: 1200, count: 3 },
   *  { breakpoint: 1600, count: 1 }
   * ]
   *
   * This would do the following:
   * - On screens smaller than 600px, the rows will be displayed in a single column
   * - On screens between 600px and 1200px, the rows will be displayed in 2 columns
   * - On screens between 1200px and 1600px, the rows will be displayed in 3 columns
   * - On screens larger than 1600px, the rows will be displayed in a single column
   * - On screens smaller than 600px and larger than 1600px (when the number is 1),
   *   the rows will be display based on the `breakpoint` prop
   * - On other screens, the rows will be displayed in card mode
   */
  splitRows?: Array<{ breakpoint: number, count: number }>

  /**
   * Key for the local storage, if not provided, the key will be generated
   * based on the parent component of the table
   * use `null` to disable this functionality
   */
  storageKey?: string | null

  /**
   * Link to the detail from page
   */
  to?: (row: any, options?: { rowKey?: string }) => RouteLocationRaw

  /**
   * Totals
   */
  totals?: Array<Pick<TableColumn, 'field' | 'label'> & { value: any }>

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class applied to the alternate row
     */
    alternateRowClass?: string

    /**
     * Class applied to the header cell
     */
    headerCellClass?: ClassType

    /**
     * Style applied to the header cell
     */
    headerCellStyle?: CSSProperties

    /**
     * Class applied to the header cell inner container (the `span` element)
     */
    headerCellInnerClass?: ClassType

    /**
     * Style applied to the header cell inner container (the `span` element)
     */
    headerCellInnerStyle?: CSSProperties

    /**
     * Class applied to the cell
     */
    rowClass?: ClassType | ((row: IItem) => ClassType)

    /**
     * Style applied to the cell
     */
    rowStyle?: CSSProperties | ((row: IItem) => CSSProperties)

    /**
     * Class applied to the cell
     */
    cellClass?: ClassType | ((row: IItem, column: TableColumn) => ClassType)

    /**
     * Style applied to the cell
     */
    cellStyle?: CSSProperties | ((row: IItem, column: TableColumn) => CSSProperties)

    /**
     * Class applied to the inner cell element (most likely the `span` element)
     */
    cellInnerClass?: ClassType | ((row: IItem, column: TableColumn) => ClassType)

    /**
     * Style applied to the inner cell element (most likely the `span` element)
     */
    cellInnerStyle?: CSSProperties | ((row: IItem, column: TableColumn) => CSSProperties)

    /**
     * Class applied to the table content
     */
    contentClass?: ClassType

    /**
     * Style applied to the table content
     */
    contentStyle?: CSSProperties

    /**
     * Class applied to the header
     */
    headerClass?: ClassType

    /**
     * Style applied to the header
     */
    headerStyle?: CSSProperties

    /**
     * Class applied to the TableToolbar
     */
    toolbarClass?: ClassType

    /**
     * Style applied to the TableToolbar
     */
    toolbarStyle?: CSSProperties

    /**
     * Class applied to the TableTop
     */
    topClass?: ClassType

    /**
     * Style applied to the TableTop
     */
    topStyle?: CSSProperties

    /**
     * Class applied to the table itself
     */
    containerClass?: ClassType

    /**
     * Style applied to the table itself
     */
    containerStyle?: CSSProperties
  }
}

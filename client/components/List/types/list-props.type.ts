import type { z } from 'zod/v4'
import type { IVirtualScrollerProps } from '$ui'
import type { ConcreteComponent, CSSProperties } from 'vue'
import type { FuseOptions } from '@vueuse/integrations/useFuse'
import type { GroupItem, SortItem } from '$utils'
import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

// Types
import type { IListItem } from './list-item.type'
import type { IListFetchFnc } from './list-fetch.type'
import type { ISelection } from '../../../types/selection.type'
import type { IListItemToAdd } from './list-item-to-add.type'

export type IListProps = {
  /**
   * When `allowAdd` is used, we can also supply items that are about to be added
   * This is useful when using the `List` inside a `Menu`
   * -> When the `Menu` is closed, the `List` instance is destroyed and we lose the items
   * so we save it in the parent component
   */
  addedItems?: IListItemToAdd[]

  /**
   * Adding configuration
   */
  addConfig?: {
    /**
     * When true, the list will allow adding new items to the list
     */
    enabled?: boolean

    /**
     * When true, the `addedItems` will not be removed on unselect
     */
    keepAddedItems?: boolean

    /**
     * When true, the component will not add the
     * new item locally, will only emit the option to the parent component.
     */
    noLocalAdd?: boolean

    /**
     * The function to use for transforming the added item
     */
    transformAddedItem?: (item: IItem) => IItem

    /**
     * Validation schema for search input if creating of new item is allowed (allowAdd is set to true)
     * @example
     * z.string().min(3).max(5)
     *
     * @example
     * {
     *   schema: z.object({
     *     name: z.string().min(3).max(5)
     *   }),
     *   key: 'name'
     * }
     */
    validation?:
      z.ZodType<any, any>
      | {
        schema: z.ZodType<any, any>
        key: string
      }
  }

  /**
   * When true, the selection can be cleared (applies for single selection only)
   */
  clearable?: boolean

  /**
   * When true, the list will have smaller padding and some other visual changed
   * to make it more compact
   */
  dense?: boolean

  /**
   * Items that should be hidden in the list
   */
  hiddenItems?: Array<IItem | string | number>

  /**
   * Set the `loading` state manually
   */
  loading?: boolean

  /**
   * The data (items) of the list
   */
  items?: IItem[]

  /**
   * Unique identifier to initialize the list store with
   */
  listId?: string

  /**
   * The props that should be passed to the SearchInput
   */
  searchInputProps?: IItem

  /**
   * Load data configuration
   */
  loadData?: {
    /**
     * The function to use for fetching the data
     */
    fnc?: IListFetchFnc

    /**
     * The key to use for the items from the server response
     */
    payloadKey?: string | null

    /**
     * The key to use for the total count of items from the server response
     */
    countKey?: string

    /**
     * When true, the `loadData` fnc will be called immediately on initialization
     * even if there are items provided through the `items` prop
     */
    immediate?: boolean

    /**
     * Whether to trigger the `loadData.fnc` on change of the search value
     *
     * You can also provide a number to specify the debounce time for the search
     */
    onSearch?: boolean | number
  }

  /**
   * Modifiers are a set of functions and other configurable options that can be
   * used to modify the behavior of the list's internals
   */
  modifiers?: {
    /**
     * A function that will be called when the list fetches data (after resolving them)
     * Must return an object with the following properties:
     * - `hasMore`: Whether there are more items to fetch
     * - `items`: The resolved items
     */
    onFetchData?: (payload: {
      /**
       * Whether the request is called upon getting more data
       */
      isFetchMore?: boolean

      /**
       * Current value of the `totalRows`, from the `List` store
       */
      totalRows: number

      /**
       * Current value of the `items`, from the `List` store
       */
      items: IItem[]

      /**
       * The "resolved" items, based on the `loadData.payloadKey`
       */
      itemsFetched: IItem[]

      /**
       * The "resolved" count, based on the `loadData.countKey`
       */
      count?: any

      /**
       * The original result of the `loadData.fnc`
       */
      res: any
    }) => { hasMore: boolean, items: IItem[], totalRows?: number }
  }

  /**
   * The move handle target
   * If not explicitly provided, the "internal" move handle will be used
   *
   * Can be
   *  DOM selector
   *  DOM element
   *  Vue component ref
   */
  moveHandleTarget?: any

  /**
   * When true, the list will not be filtered locally
   * If `loadData.fnc` is not provided and `noFilter` is true, the SearchInput will not be shown
   */
  noFilter?: boolean

  /**
   * When true, the items will not have a hover effect
   */
  noHover?: boolean

  /**
   * Grouping items
   */
  groupBy?: GroupItem[]

  /**
   * The key that holds unique ID of the item
   */
  itemKey?: string

  /**
   * The key that holds the label of the item
   */
  itemLabel?: string | ((item: IItem) => string)

  /**
   * Whether the item can be reordered
   */
  reorderable?: boolean | ((item: any) => boolean)

  /**
   * The tag to use for the row
   */
  rowComponent?: ConcreteComponent | string

  /**
   * Scroller configuration
   */
  scrollerConfig?: Pick<IVirtualScrollerProps<any>, 'rowHeight' | 'overscan' | 'threshold' | 'watchWidth'>

  /**
   * The search value
   */
  search?: string

  /**
   * Search configuration
   */
  searchConfig?: {
    /**
     * When false, the search will be disabled
     *
     * @default true
     */
    enabled?: boolean

    /**
     * When true, the search input will not be visible even when the `enabled` is true
     */
    hidden?: boolean

    /**
     * The minimum number of characters to trigger the search
     */
    minChars?: number

    /**
     * The extended search token for fuse.js library
     * https://www.fusejs.io/examples.html#extended-search
     *
     * @default "'" (contains)
     */
    fuseSearchToken?: "'" | '=' | '!' | '^' | '!^' | '$' | '!$'

    /**
     * Fuse.js options
     */
    fuseOptions?: FuseOptions<any>

    /**
     * When true, the searched items will have highlighted parts of the tex
     *
     * NOTE: Currently broken
     */
    highlight?: boolean

    /**
     * When searching, we might need to normalize the values
     *
     * For example, we might need to remove accents from the search value or similar
     * By default, the `useText().normalizeText` is used
     */
    normalizeFnc?: (val: string) => string

    /**
     * Function that is used for the search
     */
    fnc?: (
      search: string | undefined,
      items: IItem[],

      /**
       * For some cases, we need to know if the search result has "exact match"
       * (~ the search value is exactly the same as the item label)
       *
       * We leverage usage of object reference here to mutate it in-place, so we
       * can get the value back in the internal list function.
       *
       * In short, if there is an "exact match", you should set `_extra.hasExactMatch = true`
       */
      _extra?: { hasExactMatch?: boolean }
    ) => IItem[] | Promise<IItem[]>

    /**
     * When true, the search (~ local filtering) will be triggerd only once the `loadData.fnc`
     * is resolved. If no `loadData.fnc` is provided, the search will be triggered immediately
     */
    syncWithLoad?: boolean
  }

  /**
   * The selection value
   */
  selection?: ISelection

  /**
   * The list selection
   */
  selectionConfig?: {
    /**
     * If true, when item is selected, only the `itemKey` will be emitted, not
     * the whole item
     */
    emitKey?: boolean

    /**
     * Whether the selection is enabled
     */
    enabled?: boolean

    /**
     * The value to use when the selection is empty
     */
    emptyValue?: any

    /**
     * Whether the selection is multi-select
     */
    multi?: boolean

    /**
     * Whether to use checkboxes for the selection instead of the default highlighted row
     */
    useCheckbox?: boolean
  }

  /**
   * Sorting configuration
   */
  sortingConfig?: {
    /**
     * When false, the sorting will be disabled
     *
     * @default true
     */
    enabled?: boolean

    /**
     * The sorting itemscons
     */
    sortBy?: SortItem[]
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: CSSProperties

    /**
     * Class to apply to the content area
     */
    contentClass?: (hasSearch?: boolean) => ClassType

    /**
     * Style to apply to the content area
     */
    contentStyle?: (hasSearch?: boolean) => CSSProperties

    /**
     * Class to apply to the move handle
     */
    moveHandleClass?: ClassType

    /**
     * Style to apply to the move handle
     */
    moveHandleStyle?: CSSProperties

    /**
     * Class to apply to the `Banner` when there are no items
     */
    noDataClass?: ClassType

    /**
     * Style to apply to the `Banner` when there are no items
     */
    noDataStyle?: CSSProperties

    /**
     * Class to apply to the list row
     */
    rowClass?: (
      payload: {
        isSelected: boolean
        isFocused?: boolean
        row: IItem
        groupsCount: number
        isLast: boolean
      }
    ) => ClassType

    /**
     * Style to apply to the list row
     */
    rowStyle?: (payload: {
      isSelected: boolean
      isFocused?: boolean
      row: IItem
      groupsCount: number
      isLast: boolean
    }) => CSSProperties

    /**
     * Class to apply to the list row group
     */
    rowGroupClass?: (payload: { group: IGroupRow, level: number }) => ClassType

    /**
     * Style to apply to the list row group
     */
    rowGroupStyle?: (payload: { group: IGroupRow, level: number }) => CSSProperties

    /**
     * Class to apply to the search area
     */
    searchClass?: ClassType

    /**
     * Style to apply to the search area
     */
    searchStyle?: CSSProperties
  }

  /**
   * Whether to use worker for the search, sort and grouping
   */
  useWorker?: boolean

  /**
   * A function that determines whether an item is disabled
   */
  disabledFnc?: (listItem: IListItem) => boolean
}

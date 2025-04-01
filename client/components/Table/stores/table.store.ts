import { skipHydrate } from 'pinia'

// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableTotal } from '../types/table-total.type'
import type { ITableLayout } from '../types/table-layout.type'
import type { ITableSortItem } from '../types/table-sort-item.type'
import type { ITableStateColumn } from '../types/table-state-column.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'
import type { ITableEmitFncs } from '../types/table-emit-fncs.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableNavigate } from '../functions/table-navigate'
import { getListItemKey } from '../../List/functions/helpers'
import { extendColumns } from '../functions/table-extend-columns'
import { tableMergeColumns } from '../functions/table-merge-columns'
import { getStateColumnData } from '../functions/get-state-column-data'
import { tableSerializeSelect } from '../functions/table-serialize-select'
import { tableTransformColumns } from '../functions/table-transform-columns'
import { tableBuildQueryParams } from '../functions/table-build-query-params'
import { tableSerializeFilters } from '../functions/table-serialize-filters'
import { tableSerializeSorting } from '../functions/table-serialize-sorting'
import { tableBuildFetchPayload } from '../functions/table-build-fetch-payload'
import { tableSerializePagination } from '../functions/table-serialize-pagination'
import { queryBuilderInitializeItems } from '../../QueryBuilder/functions/query-builder-initialize-items'

// Components
import type HorizontalScroller from '../../Scroller/HorizontalScroller.vue'

// Provide / Inject
export const tableIdKey = Symbol('__tableId')
export const tableStorageKey = Symbol('__tableStorageKey')

export function useTableStore(
  config?: { tableId?: string, storageKey?: string, tableProps?: ITableProps },
) {
  const { tableId, tableProps } = config ?? {}
  const _tableId = tableId ?? injectLocal(tableIdKey, tableId ?? useId())
  const _storageKey = tableId ?? injectLocal(tableStorageKey, tableId ?? useId())

  const { uiState } = storeToRefs(useUIStore())

  function getStore() {
    return useTableStore({ tableId: _tableId })
  }

  return defineStore(`table.${_tableId}`, () => {
    // Utils
    const isMetaLoading = ref(false)
    const isDataLoading = ref(false)
    const isExporting = ref(false)
    const { handleRequest } = useRequest()

    /**
     * Navigates to a URL corresponding to the current state of the table
     */
    function navigate() {
      // When using URL, we navigate to the new URL
      if (modifiers.value?.useUrl) {
        const { navigate = tableNavigate } = modifiers.value ?? {}

        navigate({
          columns: internalColumns.value,
          queryParams: queryParams.value,
          isInfiniteScroll: !paginationConfig.value?.enabled,
        })
      }
    }

    // SECTION State
    const state = useLocalStorage(_storageKey, {
      columns: [] as ITableStateColumn[],
      layouts: [] as ITableLayout[],
      layoutDefault: undefined as ITableLayout | undefined,
      metaRaw: null as any,
      queryBuilder: [] as IQueryBuilderRow[],
      search: '',
      queryParams: '',

      /**
       * We sometimes need to save some custom data in table context to access it in
       * a component or similar.
       */
      customData: {} as IItem,
    })

    const customData = computed({
      get() {
        return state.value.customData
      },
      set(val) {
        state.value.customData = val
      },
    })

    const syncStateColumns = useDebounceFn(() => {
      state.value.queryParams = decodeURIComponent(queryParams.value.toString())
      state.value.columns = nonHelperColumns.value.map(getStateColumnData)
    }, 50)

    // !SECTION

    // SECTION Layout
    const tableEl = ref<HTMLDivElement>()
    const virtualScrollEl = ref<any>()
    const headerEl = ref<InstanceType<typeof HorizontalScroller>>()
    const totalsEl = ref<InstanceType<typeof HorizontalScroller>>()

    const { width: tableWidth } = useElementSize(tableEl)
    // !SECTION

    // SECTION Emits
    const emits = ref<ITableEmitFncs>({
      rowClick: (_payload: { row: any, ev?: MouseEvent }) => {},
    })
    // !SECTION

    // SECTION Configs
    const modifiers = ref<ITableProps['modifiers']>(tableProps?.modifiers)
    const splitRowsConfig = ref<ITableProps['splitRows']>(tableProps?.splitRows ?? [])
    const loadMetaData = ref<ITableProps['loadMetaData']>(tableProps?.loadMetaData)
    const loadData = ref<ITableProps['loadData']>(tableProps?.loadData)
    const queryBuilderProps = ref<ITableProps['queryBuilderProps']>(tableProps?.queryBuilderProps)
    const autofitConfig = ref<ITableProps['autoFit']>(tableProps?.autoFit)
    const features = ref<ITableProps['features']>(tableProps?.features ?? [])
    const paginationConfig = ref<NonNullable<ITableProps['paginationConfig']>>(
      tableProps?.paginationConfig ?? { pageSize: 10, options: [10, 25, 50, 100] },
    )
    const selectionConfig = ref<ITableProps['selectionConfig']>()
    const initialSchemaConfig = ref<ITableProps['initialSchemaConfig']>(tableProps?.initialSchemaConfig)
    const getFilterComponent = ref<ITableProps['getFilterComponent']>(tableProps?.getFilterComponent)

    // !SECTION

    // SECTION General
    const noState = ref(tableProps?.noState ?? false)
    const rowKey = ref<string>(tableProps?.rowKey ?? 'id')
    const search = ref(tableProps?.search ?? '')
    const queryBuilder = ref<IQueryBuilderRow[]>(tableProps?.queryBuilder ?? [])
    const emptyValue = ref<any>(tableProps?.emptyValue)
    const allowComparatorsOfSameType = ref(tableProps?.allowComparatorsOfSameType ?? false)
    const minimumColumnWidth = ref(tableProps?.minimumColumnWidth ?? 80)
    const breakpoint = ref(tableProps?.breakpoint ?? 0)
    const totals = ref<ITableTotal[]>()

    // General helper that triggers the sync of the state columns
    const columnWidths = computed(() => {
      return internalColumns.value.map(col => col.width).join(',')
    })
    // !SECTION

    // SECTION Rows
    const rows = ref<any[]>(tableProps?.rows ?? [])
    const totalRows = ref(0)
    const rowsLimit = ref(tableProps?.rowsLimit ?? 0)
    const hasMore = ref(false)
    const isFetchMore = ref(false)
    const rowClickable = ref(tableProps?.rowClickable ?? false)

    // When table is mounted, the query params watcher will trigger multiple times
    // because of column merging and possibly other things. For that reason,
    // we set the `isInitialLoad` flag to true at the start and trigger the first data fetch
    // manually (from `Table.vue`)
    const isInitialLoad = ref(true)

    const rowsColumnCount = computed(() => {
      const _tableWidth = tableWidth.value || Number.MAX_SAFE_INTEGER

      const sortedSplitRowsConfig = splitRowsConfig.value
        ?.toSorted((a, b) => b.breakpoint - a.breakpoint)

      const validBreakpoint = sortedSplitRowsConfig
        ?.find(item => _tableWidth >= item.breakpoint)
        ?.count

      return validBreakpoint ?? 1
    })

    const rowsSplit = computed(() => {
      if (rowsColumnCount.value === 1) {
        return rows.value
      }

      return rows.value.reduce((agg, row, idx) => {
        const idxInSplit = Math.floor(idx / rowsColumnCount.value)

        if (agg[idxInSplit] === undefined) {
          agg[idxInSplit] = []
        }

        agg[idxInSplit].push(row)

        return agg
      }, [] as Array<IItem[]>) as Array<IItem[]>
    })

    const isCardView = computed(() => {
      const _tableWidth = tableWidth.value || Number.MAX_SAFE_INTEGER

      return rowsColumnCount.value > 1 || _tableWidth < breakpoint.value
    })
    // !SECTION

    // SECTION Columns
    // Columns
    const internalColumns = ref<TableColumn<any>[]>([])

    const internalColumnsByField = computed(() => {
      return internalColumns.value.reduce((agg, col) => {
        agg[col.field] = col

        return agg
      }, {} as Record<string, TableColumn<any>>)
    })

    // We have 3 sources of columns - state, api and props
    const apiColumns = shallowRef<Partial<TableColumn<any>>[]>()
    const propsColumns = shallowRef<TableColumn<any>[]>(tableProps?.columns as TableColumn<any>[])

    // Column initialization
    const columnsMerged = computedWithControl(
      () => [apiColumns.value, propsColumns.value],
      () => tableMergeColumns({
        propsColumns: propsColumns.value,
        apiColumns: apiColumns.value,
        stateColumns: state.value.columns,
        useState: uiState.value.table?.autoSaveSchema && !noState.value,
      }),
    )

    // Manually trigger at the initialization
    columnsMerged.trigger()

    const visibleColumns = computed(() => {
      return internalColumns.value.filter(col => !col.hidden)
    })

    const nonHelperColumns = computed(() => {
      return internalColumns.value.filter(col => !col.isHelperCol)
    })

    watch(columnsMerged, columnsMerged => {
      // Merge columns from all the sources, remove duplicates
      let cols = columnsMerged

      // Transform columns
      const { columns: _columns, queryBuilder: qb, pagination } = tableTransformColumns({
        internalColumns: cols,
        modifiers: modifiers.value,
        defaultSchema: state.value.layoutDefault?.schema ?? '',
        urlSchema: useRequestURL().searchParams,
        initialSchemaConfig: initialSchemaConfig.value,

        // Schema should be used only in case we don't have anything in the state
        // or we don't use the `autoSaveSchema` feature
        shouldSchemaBeUsed: noState.value || !state.value?.columns?.length || !uiState.value.table?.autoSaveSchema,
      })

      cols = _columns


      // Extend columns with grouping and selection
      cols = extendColumns(cols, { selectionConfig: selectionConfig.value })

      // Set the extended columns
      internalColumns.value = cols

      // Set the query builder
      queryBuilder.value = qb.length ? qb : queryBuilderInitializeItems()

      // Set the pagination
      if (pagination?.take || pagination?.skip) {
        paginationConfig.value.pageSize = pagination.take
        currentPage.value = Math.ceil(pagination.skip / pagination.take) + 1
      }

      // Set the state columns once everything is set
      if (propsColumns.value && apiColumns.value) {
        syncStateColumns()
      }
    }, { immediate: true })
    // !SECTION

    // SECTION Pagination
    const currentPage = ref(1)
    const totalPages = computed(() => {
      const pageSize = paginationConfig.value?.pageSize ?? 10

      return Math.ceil(totalRows.value / pageSize)
    })

    const skip = computed(() => {
      const pageSize = paginationConfig.value?.pageSize ?? 10

      return (currentPage.value - 1) * pageSize
    })
    // !SECTION

    // SECTION Horizontal scroll syncing
    const virtualScrollElDom = computed(() => unrefElement(virtualScrollEl.value))

    const headerX = ref(0)
    const totalsX = ref(0)
    const { x: contentX } = useScroll(virtualScrollElDom)
    const isContentVerticallyScrollable = ref(false)

    useResizeObserver(virtualScrollElDom, () => {
      const clientHeight = virtualScrollElDom.value.clientHeight
      const scrollHeight = virtualScrollElDom.value.scrollHeight

      isContentVerticallyScrollable.value = clientHeight < scrollHeight
    })

    syncRefs(headerX, [contentX, totalsX])
    syncRefs(contentX, [headerX, totalsX])
    syncRefs(totalsX, [headerX, contentX])
    // !SECTION

    // SECTION Selection
    const selection = ref<ITableProps['selection']>(tableProps?.selection)

    const selectionByKey = computed(() => {
      const _selection = Array.isArray(selection.value)
        ? selection.value
        : [selection.value]

      return _selection.reduce((agg, selection) => {
        const key = selectionConfig.value?.selectionKey ?? rowKey.value
        const itemKey = getListItemKey(selection, key)
        agg[itemKey] = true

        return agg
      }, {} as Record<string, boolean>)
    })
    // !SECTION

    // SECTION Editing
    const cellEdit = ref<{ row: IItem, column: TableColumn }>()

    const {
      model: cellEditValue,
      syncFromParent: loadCellEditValue,
    } = useRefReset(
      () => {
        const field = cellEdit.value?.column.field
        const row = cellEdit.value?.row

        if (!field || !row) {
          return
        }

        return row[field]
      },
    )

    const isEditingCell = computed(() => !!cellEdit.value)

    function saveCellEditValue() {
      if (!cellEdit.value) {
        return
      }

      const _row = { ...cellEdit.value.row, [cellEdit.value.column.field]: cellEditValue.value }
      const originalRow = cellEdit.value.row

      cellEdit.value.column.editComponent?.onSave?.(_row, cellEdit.value.column, originalRow)

      const { row, column } = cellEdit.value
      set(row, column.field, cellEditValue.value)
    }

    function cancelCellEdit() {
      cellEdit.value = undefined
    }

    // !SECTION

    // SECTION Query
    const sortingSerialized = computed(() => {
      const { serializeSorting = tableSerializeSorting } = modifiers.value ?? {}

      return serializeSorting({ columns: internalColumns.value })
    })

    const selectSerialized = computed(() => {
      const { serializeSelectedColumns = tableSerializeSelect } = modifiers.value ?? {}

      return serializeSelectedColumns({ columns: internalColumns.value })
    })

    const queryBuilderSerialized = computed(() => {
      const { serializeFilters = tableSerializeFilters } = modifiers.value ?? {}

      return serializeFilters(queryBuilder.value)
    })

    const filtersSerialized = computed(() => {
      const filters = internalColumns.value.flatMap(col => col.filterDbQuery)
      const { serializeFilters = tableSerializeFilters } = modifiers.value ?? {}

      return serializeFilters(filters)
    })

    const paginationSerialized = computed(() => {
      const { serializePagination = tableSerializePagination } = modifiers.value ?? {}

      return serializePagination({
        skip: skip.value,
        take: paginationConfig.value?.pageSize ?? 10,
      })
    })

    const queryParams = computed(() => {
      return tableBuildQueryParams({
        select: selectSerialized.value,
        sorting: sortingSerialized.value,
        filters: filtersSerialized.value,
        queryBuilder: queryBuilderSerialized.value,
        search: search.value,
        ...paginationSerialized.value,
      })
    })

    function getFetchPayload(
      payload?: Partial<Parameters<typeof tableBuildFetchPayload>[0]>,
    ) {
      const { buildFetchPayload = tableBuildFetchPayload } = modifiers.value ?? {}

      const lastRow = rows.value[rows.value.length - 1] as IItem
      return buildFetchPayload({
        columns: internalColumns.value,
        queryBuilder: queryBuilder.value,
        search: search.value,
        queryParams: queryParams.value,
        orderBy: internalColumns.value.flatMap(col => col.sortDbQuery).filter(Boolean) as ITableSortItem[],
        getStore,
        pagination: {
          skip: isFetchMore.value ? rows.value.length : skip.value,
          take: paginationConfig.value?.pageSize ?? 10,
        },

        ...(isFetchMore.value && { fetchMore: { lastRow, hasMore: hasMore.value } }),
        ...payload,
      })
    }
    // !SECTION

    // SECTION Lifecycle
    /**
     * Once data are fetched, we might need to run some functions (like `fitColumns`)
     * This queue will hold those functions and run them consecutively after the data are fetched
     */
    const onDataFetchQueue = ref<Array<(...args: any[]) => any | Promise<any>>>([])

    async function runOnDataFetchQueue() {
      for await (const fnc of onDataFetchQueue.value) {
        await fnc()
      }

      // Reset the queue
      onDataFetchQueue.value = []
    }

    /**
     * When filter or query builder changes, we need to reset the pagination
     */
    watch([filtersSerialized, queryBuilderSerialized], () => {
      if (currentPage.value > 1) {
        currentPage.value = 1
      }
    })

    // React to the query params changes
    watch(queryParams, queryParams => {
      console.log('Query params change', decodeURIComponent(queryParams.toString()))

      // We should only sync the state once we're use every relevant part is loaded
      // We can assume that the meta is loaded if `apiColumns` is not `undefined`
      // and `propsColumns` is not `undefined`
      if (apiColumns.value && propsColumns.value) {
        syncStateColumns()

        // Load data with new query params
        fetchAndSetData()
      }
    })

    watch(columnWidths, () => {
      if (apiColumns.value && apiColumns.value) {
        syncStateColumns()
      }
    })
    // !SECTION

    // SECTION Data fetching
    async function fetchAndSetMetaData() {
      // When there is no `loadMetaData.fnc`, we just set empty columns
      if (!loadMetaData.value?.fnc) {
        apiColumns.value = []

        return
      }

      const fetchPayload = getFetchPayload()
      isMetaLoading.value = true
      const res = await handleRequest(
        () => loadMetaData.value?.fnc?.({ tablePayload: fetchPayload, getStore }),
        {
          noResolve: true,
          onComplete: () => isMetaLoading.value = false,
          onError: error => {
            isMetaLoading.value = false
            loadMetaData.value?.onError?.(error)
          },
        },
      )

      state.value.metaRaw = res
      const resModified = loadMetaData.value?.onFetch?.({ res, getStore }) ?? res

      const {
        columnsKey = 'columns',
        layoutsKey = 'layouts',
        defaultLayoutKey = 'defaultLayout',
      } = loadMetaData.value ?? {}

      apiColumns.value = get(resModified, columnsKey) ?? []
      state.value.layouts = get(resModified, layoutsKey) ?? state.value.layouts
      state.value.layoutDefault = get(resModified, defaultLayoutKey) ?? state.value.layoutDefault

      return resModified
    }

    async function fetchAndSetData(payload?: {
      isFetchMore?: boolean
      force?: boolean
    }) {
      const isInvalidFetchMore = payload?.isFetchMore && !hasMore.value
      const isOverLimit = rows.value.length >= rowsLimit.value
      const isInitial = isInitialLoad.value && !payload?.force

      if (isOverLimit || isDataLoading.value || isInvalidFetchMore || isInitial || !loadData.value?.fnc) {
        return
      }

      isFetchMore.value = hasMore.value && !!payload?.isFetchMore
      const fetchPayload = getFetchPayload()

      isDataLoading.value = true
      const res = await handleRequest(
        () => loadData.value?.fnc?.(fetchPayload),
        {
          noResolve: true,
          onComplete: () => isDataLoading.value = false,
          onError: error => {
            isDataLoading.value = false
            loadData.value?.onError?.(error)
          },
        },
      )

      const resModified = loadData.value?.onFetch?.(res) ?? res
      const { payloadKey, countKey = 'count' } = loadData.value ?? {}

      const rowsFetched = payloadKey ? (get(resModified, payloadKey) ?? []) : resModified
      const countFetched = get(resModified, countKey) ?? 0

      rows.value = isFetchMore.value ? [...rows.value, ...rowsFetched] : rowsFetched
      totalRows.value = isFetchMore.value ? totalRows.value : countFetched
      hasMore.value = rows.value.length < totalRows.value

      if (!isFetchMore.value) {
        onDataFetchQueue.value.push(navigate)
      }

      runOnDataFetchQueue()
    }
    // !SECTION

    return {
      // Utils
      isMetaLoading,
      isDataLoading,
      isExporting,
      navigate,

      // State,
      state,
      customData,

      // Layout
      tableEl,
      virtualScrollEl,
      headerEl,
      totalsEl,

      // Emits
      emits,

      // Configs
      modifiers,
      loadMetaData,
      loadData,
      queryBuilderProps: skipHydrate(queryBuilderProps),
      autofitConfig,
      features,
      paginationConfig,
      selectionConfig,
      splitRowsConfig,
      initialSchemaConfig,

      // General
      rowKey,
      search,
      queryBuilder,
      emptyValue,
      allowComparatorsOfSameType,
      minimumColumnWidth,
      breakpoint,
      totals,

      // Rows
      rows,
      rowsColumnCount,
      rowsSplit,
      isCardView,
      rowsLimit,
      isInitialLoad,
      hasMore,
      isFetchMore,
      rowClickable,

      // Columns
      internalColumns: skipHydrate(internalColumns),
      internalColumnsByField: skipHydrate(internalColumnsByField),
      propsColumns: skipHydrate(propsColumns),
      apiColumns,
      visibleColumns,
      nonHelperColumns,

      // Pagination
      totalRows,
      currentPage,
      totalPages,
      skip,

      // Horizontal scroll syncing
      headerX,
      totalsX,
      contentX,
      isContentVerticallyScrollable,

      // Selection
      selection,
      selectionByKey,

      // Editing
      cellEdit,
      isEditingCell,
      cellEditValue,
      loadCellEditValue,
      saveCellEditValue,
      cancelCellEdit,

      // Query
      queryParams,
      getFetchPayload,

      // Miscellaneous
      onDataFetchQueue,
      getFilterComponent,

      // Data fetching
      fetchAndSetMetaData,
      fetchAndSetData,
      runOnDataFetchQueue,
    }
  })()
}

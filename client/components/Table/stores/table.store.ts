import { skipHydrate } from 'pinia'

// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableLayout } from '../types/table-layout.type'
import type { ITableSortItem } from '../types/table-sort-item.type'
import type { ITableStateColumn } from '../types/table-state-column.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Provide / Inject
import { tableIdKey } from '../provide/table.provide'

// Functions
import { tableNavigate } from '../functions/table-navigate'
import { tableMergeColumns } from '../functions/table-merge-columns'
import { getListItemKey } from '../../List/functions/helpers'
import { extendColumns } from '../functions/table-extend-columns'
import { getStateColumnData } from '../functions/get-state-column-data'
import { tableTransformColumns } from '../functions/table-transform-columns'
import { tableBuildQueryParams } from '../functions/table-build-query-params'
import { tableSerializeFilters } from '../functions/table-serialize-filters'
import { tableSerializeSorting } from '../functions/table-serialize-sorting'
import { tableSerializeSelect } from '../functions/table-serialize-select'
import { tableSerializePagination } from '../functions/table-serialize-pagination'
import { queryBuilderInitializeItems } from '../../QueryBuilder/functions/query-builder-initialize-items'

// Components
import type HorizontalScroller from '../../Scroller/HorizontalScroller.vue'
import { tableBuildFetchPayload } from '../functions/table-build-fetch-payload'

export function useTableStore(
  config?: { tableId?: string, tableProps?: ITableProps },
) {
  const { tableId, tableProps } = config ?? {}
  const _tableId = tableId ?? injectLocal(tableIdKey, tableId ?? useId())

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

    // SECTION State
    const state = useLocalStorage(_tableId, {
      columns: [] as ITableStateColumn[],
      layouts: [] as ITableLayout[],
      layoutDefault: undefined as ITableLayout | undefined,
      metaRaw: null as any,
      queryBuilder: [] as IQueryBuilderRow[],
      search: '',
    })

    const syncStateColumns = useDebounceFn(() => {
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
    // !SECTION

    // SECTION General
    const rowKey = ref<string>(tableProps?.rowKey ?? 'id')
    const search = ref(tableProps?.search ?? '')
    const queryBuilder = ref<IQueryBuilderRow[]>(tableProps?.queryBuilder ?? [])
    const emptyValue = ref<any>(tableProps?.emptyValue)
    const allowComparatorsOfSameType = ref(tableProps?.allowComparatorsOfSameType ?? false)
    const minimumColumnWidth = ref(tableProps?.minimumColumnWidth ?? 80)
    const breakpoint = ref(tableProps?.breakpoint ?? 0)

    /**
     * We sometimes need to save some custom data in table context to access it in
     * a component or similar.
     */
    const customData = ref<IItem>({})

    // General helper that triggers the sync of the state columns
    const columnWidths = computed(() => {
      return internalColumns.value.map(col => col.width).join(',')
    })
    // !SECTION

    // SECTION Rows
    const rows = ref<IItem[]>(tableProps?.rows ?? [])
    const totalRows = ref(0)
    const rowsLimit = ref(tableProps?.rowsLimit ?? 0)
    const hasMore = ref(false)
    const isFetchMore = ref(false)

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
        useState: uiState.value.table?.autoSaveSchema,
      }),
    )

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
        schemaParams: state.value.layoutDefault?.schema ?? '',
        urlParams: useRequestURL().searchParams,
        shouldSchemaBeUsed: !state.value?.columns?.length,
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

      const { row, column } = cellEdit.value
      set(row, column.field, cellEditValue.value)
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
        sorting: sortingSerialized.value,
        select: selectSerialized.value,
        filters: filtersSerialized.value,
        queryBuilder: queryBuilderSerialized.value,
        search: search.value,
        ...paginationSerialized.value,
      })
    })
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
      // We should only sync the state once we're use every relevant part is loaded
      // We can assume that the meta is loaded if `apiColumns` is not `undefined`
      // and `propsColumns` is not `undefined`
      if (apiColumns.value && propsColumns.value) {
        syncStateColumns()

        // Load data with new query params
        fetchAndSetData()
      }

      // When using URL, we navigate to the new URL
      if (modifiers.value?.useUrl) {
        const { navigate = tableNavigate } = modifiers.value ?? {}

        navigate({
          column: internalColumns.value,
          queryParams,
          isInfiniteScroll: !paginationConfig.value?.enabled,
        })
      }
    })

    watch(columnWidths, syncStateColumns)
    // !SECTION

    // SECTION Data fetching
    async function fetchAndSetMetaData() {
      // When there is no `loadMetaData.fnc`, we just set empty columns
      if (!loadMetaData.value?.fnc) {
        apiColumns.value = []

        return
      }

      isMetaLoading.value = true
      const res = await handleRequest(
        () => loadMetaData.value?.fnc?.(getStore),
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
      const resModified = loadMetaData.value?.onFetch?.(res) ?? res

      const {
        columnsKey = 'columns',
        layoutsKey = 'layouts',
        defaultLayoutKey = 'defaultLayout',
      } = loadMetaData.value ?? {}

      apiColumns.value = get(resModified, columnsKey) ?? []
      state.value.layouts = get(resModified, layoutsKey) ?? state.value.layouts
      state.value.layoutDefault = get(resModified, defaultLayoutKey) ?? state.value.layoutDefault
    }

    async function fetchAndSetData(payload?: {
      isFetchMore?: boolean
      force?: boolean
    }) {
      const isInvalidFetchMore = payload?.isFetchMore && !hasMore.value
      const isOverLimit = rows.value.length >= rowsLimit.value
      const isInitial = isInitialLoad.value && !payload?.force
      if (isOverLimit || isDataLoading.value || isInvalidFetchMore || isInitial) {
        return
      }

      isFetchMore.value = hasMore.value && !!payload?.isFetchMore

      const {
        buildFetchPayload = tableBuildFetchPayload,
      } = modifiers.value ?? {}

      const lastRow = rows.value[rows.value.length - 1] as IItem
      const fetchPayload = buildFetchPayload({
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
      })

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
      const { payloadKey = 'data', countKey = 'count' } = loadData.value ?? {}

      const rowsFetched = get(resModified, payloadKey) ?? []
      const countFetched = get(resModified, countKey) ?? 0

      rows.value = isFetchMore.value ? [...rows.value, ...rowsFetched] : rowsFetched
      totalRows.value = countFetched || totalRows.value
      hasMore.value = rows.value.length < totalRows.value

      runOnDataFetchQueue()
    }
    // !SECTION

    return {
      // Utils
      isMetaLoading,
      isDataLoading,
      isExporting,

      // State,
      state,

      // Layout
      tableEl,
      virtualScrollEl,
      headerEl,
      totalsEl,

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

      // General
      rowKey,
      search,
      queryBuilder,
      emptyValue,
      allowComparatorsOfSameType,
      minimumColumnWidth,
      breakpoint,
      customData,

      // Rows
      rows,
      rowsColumnCount,
      rowsSplit,
      isCardView,
      rowsLimit,
      isInitialLoad,
      hasMore,
      isFetchMore,

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

      // Query
      queryParams,

      // Miscellaneous
      onDataFetchQueue,

      // Data fetching
      fetchAndSetMetaData,
      fetchAndSetData,
    }
  })()
}

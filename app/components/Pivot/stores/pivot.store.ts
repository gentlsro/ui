// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotColumnTreeNode } from '../functions/pivot-column-collapse'
import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'
import type { IPivotEmitFncs } from '../types/pivot-emits.type'

// Functions
import { usePivotTransform } from '../composables/usePivotTransform'
import { pivotFetchData } from '../functions/pivot-fetch-data'
import { applyPivotEmptyRows } from '../functions/pivot-transform-data'
import {
  buildPivotPromotedRowLabelLevels,
  getPivotStickyIndices,
  isPivotRowVisible,
  togglePivotGroupCollapse,
} from '../functions/pivot-group-collapse'
import {
  buildVisiblePivotValueColumns,
  togglePivotColumnGroupCollapse,
} from '../functions/pivot-column-collapse'
import {
  getPivotFilterItems,
  getPivotItemsByMultiUsage,
  getPivotItemsBySingleUsage,
  resolvePivotValueFields,
  syncPivotMultiUsageIndices,
  syncPivotSingleUsageIndices,
} from '../functions/pivot-item-usage'
import {
  normalizePivotFilterSlotIndices,
  syncTableColumnFiltersToPivotItem,
} from '../functions/pivot-filter-usage'

// Models
import { PivotItem } from '../models/pivot-item.model'
import type { TableColumn } from '../../Table/models/table-column.model'
import {
  PIVOT_DEFAULT_MEASURE_COLUMN_WIDTH,
  PIVOT_MEASURE_ROW_FIELD,
} from '../constants/pivot-measure-row.constant'

export const PIVOT_ID_KEY = Symbol('__pivotId')

type IConfig<T extends IItem = IItem> = {
  props?: IPivotProps<T>
  injectionKey?: string
}

function createStore<T extends IItem = IItem>(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig<T>) => {
    const { props } = payload ?? {}
    const instance = getCurrentInstance()

    // Configs
    const loadData = ref(props?.loadData)
    const collapseConfig = ref(props?.collapseConfig) as Ref<IPivotProps<T>['collapseConfig']>
    const performance = ref(props?.performance) as Ref<IPivotProps<T>['performance']>
    const ui = ref(props?.ui)

    const config = initRef({
      propName: 'config',
      instance,
      props,
      defaultValue: {},
    }) as Ref<IPivotProps<T>['config']>

    // Utils
    const { formatNumber } = useNumber()
    const { currentLocale } = useLocale()
    const {
      transformPivotData,
      continueTransform: continuePendingTransform,
      cancelTransform: cancelPendingTransform,
    } = usePivotTransform()

    const { isLoading: isRequestLoading, fn } = useFn({
      source: { type: 'store', name: 'pivot' },
    })

    const isLoadingSource = initRef({
      propName: 'loading',
      instance,
      props,
      defaultValue: false,
    })

    const isLoading = computed(() => {
      return isRequestLoading.value || isLoadingSource.value || isTransforming.value
    })

    const isFirstFetch = ref(true)

    // Layout
    const pivotEl = ref<HTMLElement>()
    const rowHeaderEl = ref<HTMLElement>()
    const valueHeaderEl = ref<HTMLElement>()
    const rowsVirtualScrollEl = ref<{ rerender: (noEmit?: boolean, resetHeights?: boolean) => void }>()
    const valuesVirtualScrollEl = ref<{ rerender: (noEmit?: boolean, resetHeights?: boolean) => void }>()
    const rowsWrapperEl = ref<HTMLElement>()
    const isFirstRender = shallowRef(true)
    const isTransforming = ref(false)
    const performanceWarning = shallowRef<IPivotTransformEstimate>()
    const transformError = shallowRef<Error>()
    const minimumColumnWidth = toRef(props ?? {}, 'minimumColumnWidth', 80)
    const hoveredIdx = ref<number | undefined>()
    const rowClickable = computed(() => props?.rowClickable ?? false)
    const cellClickable = computed(() => props?.cellClickable ?? false)

    const emits = ref<IPivotEmitFncs<T>>({
      rowClick: () => {},
      cellClick: () => {},
    })

    const title = computed(() => {
      if (typeof props?.title === 'function') {
        return props.title()
      }

      return props?.title ?? ''
    })

    const state = ref<IPivotState>({
      collapsedGroupIds: new Set<string>(),
      collapsedColumnGroupIds: new Set<string>(),
    })

    // Pivot config
    const sourceData = initRef({
      propName: 'data',
      instance,
      props,
      defaultValue: [],
    }) as Ref<T[]>

    const items = initRef({
      propName: 'items',
      instance,
      props,
      defaultValue: [],
    }) as Ref<PivotItem<T>[]>

    const rows = computed({
      get() {
        return getPivotItemsBySingleUsage(items.value, 'row')
      },
      set(value) {
        syncPivotSingleUsageIndices({ items, ordered: value, role: 'row' })
      },
    })

    const columns = computed({
      get() {
        return getPivotItemsBySingleUsage(items.value, 'column')
      },
      set(value) {
        syncPivotSingleUsageIndices({ items, ordered: value, role: 'column' })
      },
    })

    const values = computed({
      get() {
        return getPivotItemsByMultiUsage(items.value, 'value')
      },
      set(value) {
        syncPivotMultiUsageIndices({ items, ordered: value, role: 'value' })
      },
    })

    const resolvedValueFields = computed(() => resolvePivotValueFields(items.value))
    const resolvedValueFieldsById = computed(() => new Map(
      resolvedValueFields.value.map(value => [value.measureId, value]),
    ))

    const filters = computed({
      get() {
        return getPivotFilterItems(items.value)
      },
      set(value) {
        syncPivotMultiUsageIndices({ items, ordered: value, role: 'filter' })
      },
    })

    const measureRowColumn = shallowRef(new PivotItem<T>({
      field: PIVOT_MEASURE_ROW_FIELD as ObjectKey<T>,
      label: '',
      width: config.value?.measureColumnWidth ?? PIVOT_DEFAULT_MEASURE_COLUMN_WIDTH,
      dataType: 'string',
      resizable: true,
    }))

    watch(
      () => config.value?.measureColumnWidth,
      measureColumnWidth => {
        const width = measureColumnWidth ?? PIVOT_DEFAULT_MEASURE_COLUMN_WIDTH
        measureRowColumn.value.width = width
        measureRowColumn.value.widthResolved = width
      },
      { immediate: true },
    )

    function getPivotLayoutSignature(candidateItems = items.value) {
      const rowFields = getPivotItemsBySingleUsage(candidateItems, 'row')
      const columnFields = getPivotItemsBySingleUsage(candidateItems, 'column')

      return JSON.stringify({
        rows: rowFields.map(row => String(row.field)),
        columns: columnFields.map(column => String(column.field)),
      })
    }

    const pivotLayoutSignature = ref(getPivotLayoutSignature())

    const showMeasureColumn = computed(() => {
      return !!config.value?.valuesOnRows && values.value.length > 1
    })

    const displayRowFields = computed(() => {
      if (!showMeasureColumn.value) {
        return rows.value
      }

      return [...rows.value, measureRowColumn.value]
    })

    const displayRowFieldCount = computed(() => displayRowFields.value.length)

    function getRowFieldWidthPx(row: PivotItem<T>) {
      if (Number.isFinite(row._width) && row._width > 0) {
        return row._width
      }

      const resolved = Number.parseFloat(row.widthResolved)

      return Number.isFinite(resolved) && resolved > 0 ? resolved : row.minWidth
    }

    const displayRowFieldsTotalWidthPx = computed(() => {
      return displayRowFields.value.reduce((sum, row) => sum + getRowFieldWidthPx(row), 0)
    })

    const resolvedLeftPanelWidth = computed(() => {
      if (config.value?.leftPanelWidth) {
        return config.value.leftPanelWidth
      }

      const totalWidth = displayRowFieldsTotalWidthPx.value

      return totalWidth > 0 ? `${totalWidth}px` : undefined
    })

    // Data
    const data = ref<IPivotDataItem<T>[]>([])
    const valueColumns = ref<IPivotValueColumnItem<T>[]>([])
    const valueHeaderRows = ref<IPivotValueHeaderCell[][]>([])
    const columnTree = ref<IPivotColumnTreeNode[]>([])

    const layoutValueColumns = computed(() => valueColumns.value.map(column => {
      const valueField = resolvedValueFieldsById.value.get(column.measureId)

      if (!valueField) {
        return column
      }

      return {
        ...column,
        valueField: valueField.field,
        value: valueField.item ?? column.value,
        width: valueField.widthResolved,
      }
    }))

    const visibleValueLayout = computed(() => {
      return buildVisiblePivotValueColumns({
        columnFields: columns.value,
        valueFields: resolvedValueFields.value,
        tree: columnTree.value,
        collapsedColumnGroupIds: state.value.collapsedColumnGroupIds,
        allValueColumns: layoutValueColumns.value as IPivotValueColumnItem<T>[],
        valuesOnRows: config.value?.valuesOnRows,
      })
    })

    const visibleValueColumns = computed(() => visibleValueLayout.value.valueColumns)
    const visibleValueHeaderRows = computed(() => visibleValueLayout.value.valueHeaderRows)

    const totalRows = shallowRef<number>()

    const visibleData = computed(() => {
      const visible = (data.value as IPivotDataItem<T>[]).filter(row => {
        return isPivotRowVisible(row, state.value.collapsedGroupIds, rows.value.length)
      })

      return applyPivotEmptyRows(visible, {
        useEmptyRow: config.value?.useEmptyRow,
        rowFieldCount: rows.value.length,
        collapsedGroupIds: state.value.collapsedGroupIds,
        rowFields: displayRowFields.value,
        valueColumns: visibleValueColumns.value as IPivotValueColumnItem<T>[],
        includeMeasureColumn: showMeasureColumn.value,
      })
    })

    const visibleStickyIndices = computed(() => {
      return getPivotStickyIndices(visibleData.value, rows.value.length)
    })

    const promotedRowLabelLevelsById = computed(() => {
      return buildPivotPromotedRowLabelLevels({
        visibleRows: visibleData.value,
        collapsedGroupIds: state.value.collapsedGroupIds,
        rowFieldCount: rows.value.length,
      })
    })

    function updateConfig(partial: Partial<NonNullable<IPivotProps<T>['config']>>) {
      config.value = {
        ...config.value,
        ...partial,
      }
    }

    function toggleGroupCollapse(groupId: string) {
      state.value.collapsedGroupIds = togglePivotGroupCollapse(state.value.collapsedGroupIds, groupId)
    }

    function toggleColumnGroupCollapse(groupId: string) {
      state.value.collapsedColumnGroupIds = togglePivotColumnGroupCollapse(
        state.value.collapsedColumnGroupIds,
        groupId,
      )
    }

    function syncPivotItemFilters(item: PivotItem<T>, column: TableColumn<T>) {
      syncTableColumnFiltersToPivotItem(item, column)
      normalizePivotFilterSlotIndices(items.value)
    }

    function getPivotAggregationSignature(
      candidateItems: PivotItem<T>[],
    ) {
      return JSON.stringify({
        rows: getPivotItemsBySingleUsage(candidateItems, 'row').map(item => String(item.field)),
        columns: getPivotItemsBySingleUsage(candidateItems, 'column').map(item => String(item.field)),
        values: resolvePivotValueFields(candidateItems).map(value => ({
          id: value.measureId,
          field: String(value.field),
          summaryType: value.summaryType,
          summaryFormat: value.summaryFormat ? String(value.summaryFormat) : undefined,
        })),
        filters: candidateItems.flatMap(item => (item.usage.filter ?? []).map(filter => ({
          field: String(item.field),
          index: filter.index,
          comparator: filter.comparator,
          filterValue: filter.filterValue,
        }))),
      })
    }

    function getPivotProjectionSignature(
      candidateItems: PivotItem<T>[],
      candidateConfig: IPivotProps<T>['config'],
    ) {
      return JSON.stringify({
        valuesOnRows: !!candidateConfig?.valuesOnRows,
        values: resolvePivotValueFields(candidateItems).map(value => ({
          id: value.measureId,
          label: value._label,
        })),
      })
    }

    const aggregationSignature = computed(() => getPivotAggregationSignature(items.value))
    const projectionSignature = computed(() => getPivotProjectionSignature(items.value, config.value))
    const sourceDataVersion = shallowRef(0)
    let recomputeGeneration = 0
    let lastCompletedTransformKey = ''

    function getAggregationKey(signature: string) {
      return `${sourceDataVersion.value}:${signature}`
    }

    function getTransformKey(aggregation: string, projection: string) {
      return `${getAggregationKey(aggregation)}:${projection}`
    }

    async function runTransform(payload?: {
      candidateItems?: PivotItem<T>[]
      candidateConfig?: IPivotProps<T>['config']
      commitConfiguration?: boolean
    }) {
      const candidateItems = payload?.candidateItems ?? items.value
      const candidateConfig = payload?.candidateConfig ?? config.value
      const candidateRows = getPivotItemsBySingleUsage(candidateItems, 'row')
      const candidateColumns = getPivotItemsBySingleUsage(candidateItems, 'column')
      const candidateValues = resolvePivotValueFields(candidateItems)
      const candidateAggregationSignature = getPivotAggregationSignature(candidateItems)
      const candidateProjectionSignature = getPivotProjectionSignature(candidateItems, candidateConfig)
      const transformKey = getTransformKey(
        candidateAggregationSignature,
        candidateProjectionSignature,
      )
      const generation = ++recomputeGeneration
      const nextLayoutSignature = getPivotLayoutSignature(candidateItems)
      const hierarchyChanged = nextLayoutSignature !== pivotLayoutSignature.value
      const nextState: IPivotState = hierarchyChanged
        ? {
            collapsedGroupIds: new Set<string>(),
            collapsedColumnGroupIds: new Set<string>(),
          }
        : {
            collapsedGroupIds: new Set(state.value.collapsedGroupIds),
            collapsedColumnGroupIds: new Set(state.value.collapsedColumnGroupIds),
          }
      const nextIsFirstRender = shallowRef(hierarchyChanged || isFirstRender.value)

      isTransforming.value = true
      performanceWarning.value = undefined
      transformError.value = undefined

      try {
        const result = await transformPivotData({
          data: sourceData.value,
          rows: candidateRows,
          columns: candidateColumns,
          values: candidateValues,
          items: candidateItems,
          collapseConfig: collapseConfig.value,
          state: nextState,
          isFirstRender: nextIsFirstRender,
          formatNumber,
          locale: currentLocale.value.code,
          valuesOnRows: candidateConfig?.valuesOnRows,
          performance: performance.value,
          aggregationKey: getAggregationKey(candidateAggregationSignature),
          onPerformanceWarning: estimate => {
            if (generation === recomputeGeneration) {
              performanceWarning.value = estimate
            }
          },
        })

        if (generation !== recomputeGeneration) {
          return false
        }

        if (payload?.commitConfiguration) {
          items.value = candidateItems
          config.value = candidateConfig
        }

        pivotLayoutSignature.value = nextLayoutSignature
        state.value = nextState
        isFirstRender.value = nextIsFirstRender.value
        data.value = result.data
        valueColumns.value = result.valueColumns
        valueHeaderRows.value = result.valueHeaderRows
        columnTree.value = result.columnTree
        performanceWarning.value = undefined
        lastCompletedTransformKey = transformKey

        await nextTick()
        rowsVirtualScrollEl.value?.rerender()
        valuesVirtualScrollEl.value?.rerender()

        return true
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return false
        }

        if (generation === recomputeGeneration) {
          transformError.value = error instanceof Error ? error : new Error(String(error))
        }

        return false
      } finally {
        if (generation === recomputeGeneration) {
          isTransforming.value = false
        }
      }
    }

    function recomputeData() {
      return runTransform()
    }

    function applyConfiguration(payload: {
      items: PivotItem<T>[]
      config: IPivotProps<T>['config']
    }) {
      return runTransform({
        candidateItems: payload.items,
        candidateConfig: payload.config,
        commitConfiguration: true,
      })
    }

    function continueTransform() {
      performanceWarning.value = undefined
      continuePendingTransform()
    }

    function cancelTransform() {
      performanceWarning.value = undefined
      cancelPendingTransform()
    }

    let fetchGeneration = 0

    async function fetchAndSetData() {
      const generation = ++fetchGeneration
      const res = await pivotFetchData({ getStore: () => returnedData })

      if (generation !== fetchGeneration) {
        return
      }

      sourceData.value = markRaw(res.items)
      totalRows.value = !isNil(res.totalRows)
        ? res.totalRows
        : isNil(totalRows.value) ? data.value.length : totalRows.value
    }

    watch(sourceData, () => sourceDataVersion.value++, { flush: 'sync' })

    watch(
      [sourceDataVersion, aggregationSignature, projectionSignature],
      ([, aggregation, projection]) => {
        if (getTransformKey(aggregation, projection) !== lastCompletedTransformKey) {
          recomputeData()
        }
      },
      { immediate: true },
    )

    const returnedData = {
      // Configs
      loadData,
      collapseConfig,
      performance,
      config,
      ui,

      // Utils
      isLoading,
      isFirstFetch,
      isTransforming,
      performanceWarning,
      transformError,
      fn,

      // Layout
      pivotEl,
      rowHeaderEl,
      valueHeaderEl,
      rowsVirtualScrollEl,
      valuesVirtualScrollEl,
      rowsWrapperEl,
      minimumColumnWidth,
      state,
      hoveredIdx,
      rowClickable,
      cellClickable,

      // Emits
      emits,
      title,

      // Data fetching
      fetchAndSetData,
      recomputeData,
      applyConfiguration,
      continueTransform,
      cancelTransform,
      syncPivotItemFilters,
      toggleGroupCollapse,
      toggleColumnGroupCollapse,
      updateConfig,

      // Pivot config
      items,
      rows,
      displayRowFields,
      displayRowFieldCount,
      displayRowFieldsTotalWidthPx,
      resolvedLeftPanelWidth,
      showMeasureColumn,
      measureRowColumn: computed(() => measureRowColumn.value),
      columns,
      values,
      filters,

      // Data
      data,
      sourceData,
      visibleData,
      visibleStickyIndices,
      promotedRowLabelLevelsById,
      valueColumns,
      visibleValueColumns,
      valueHeaderRows,
      visibleValueHeaderRows,
      columnTree,
      totalRows,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function usePivotStore<T extends IItem = IItem>(payload?: IConfig<T>) {
  let injectionKey = payload?.injectionKey ?? injectLocal(PIVOT_ID_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(PIVOT_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvidePivotStore, useConsumePivotStore] = createStore<T>(injectionKey)!

  return useConsumePivotStore() ?? useProvidePivotStore(payload)
}

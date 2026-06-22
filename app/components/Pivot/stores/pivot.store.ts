// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotColumnTreeNode } from '../functions/pivot-column-collapse'

// Functions
import { usePivotTransform } from '../composables/usePivotTransform'
import { pivotFetchData } from '../functions/pivot-fetch-data'
import { applyPivotEmptyRows } from '../functions/pivot-transform-data'
import {
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
    const { transformPivotData } = usePivotTransform()

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
    const minimumColumnWidth = toRef(props ?? {}, 'minimumColumnWidth', 80)
    const hoveredIdx = ref<number | undefined>()

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

    function getPivotLayoutSignature() {
      return `${rows.value.map(row => String(row.field)).join('|')}::${columns.value.map(column => String(column.field)).join('|')}`
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

    const visibleValueLayout = computed(() => {
      return buildVisiblePivotValueColumns({
        columnFields: columns.value,
        valueFields: values.value,
        tree: columnTree.value,
        collapsedColumnGroupIds: state.value.collapsedColumnGroupIds,
        allValueColumns: valueColumns.value as IPivotValueColumnItem<T>[],
        valuesOnRows: config.value?.valuesOnRows,
      })
    })

    const visibleValueColumns = computed(() => visibleValueLayout.value.valueColumns)
    const visibleValueHeaderRows = computed(() => visibleValueLayout.value.valueHeaderRows)

    const totalRows = shallowRef<number>()

    const visibleData = computed(() => {
      const visible = (data.value as IPivotDataItem<T>[]).filter(row => {
        return isPivotRowVisible(row, state.value.collapsedGroupIds)
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
      recomputeData()
    }

    async function recomputeData() {
      isTransforming.value = true

      try {
        const nextLayoutSignature = getPivotLayoutSignature()

        if (nextLayoutSignature !== pivotLayoutSignature.value) {
          pivotLayoutSignature.value = nextLayoutSignature
          isFirstRender.value = true
          state.value.collapsedGroupIds = new Set<string>()
          state.value.collapsedColumnGroupIds = new Set<string>()
        }

        const result = await transformPivotData({
          data: sourceData.value,
          rows: rows.value,
          columns: columns.value,
          values: resolvePivotValueFields(items.value),
          items: items.value,
          collapseConfig: collapseConfig.value,
          state: state.value,
          isFirstRender,
          formatNumber,
          locale: currentLocale.value.code,
          valuesOnRows: config.value?.valuesOnRows,
        })

        data.value = result.data
        valueColumns.value = result.valueColumns
        valueHeaderRows.value = result.valueHeaderRows
        columnTree.value = result.columnTree

        await nextTick()
        rowsVirtualScrollEl.value?.rerender()
        valuesVirtualScrollEl.value?.rerender()
      } finally {
        isTransforming.value = false
      }
    }

    async function fetchAndSetData() {
      const res = await pivotFetchData({ getStore: () => returnedData })

      sourceData.value = res.items
      totalRows.value = !isNil(res.totalRows)
        ? res.totalRows
        : isNil(totalRows.value) ? data.value.length : totalRows.value
    }

    watch([items, sourceData, () => config.value?.valuesOnRows], () => {
      recomputeData()
    })

    const returnedData = {
      // Configs
      loadData,
      collapseConfig,
      config,
      ui,

      // Utils
      isLoading,
      isFirstFetch,
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
      title,

      // Data fetching
      fetchAndSetData,
      recomputeData,
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

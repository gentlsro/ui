// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'

// Functions
import { pivotFetchData } from '../functions/pivot-fetch-data'
import { applyPivotEmptyRows, pivotTransformData } from '../functions/pivot-transform-data'
import { isPivotRowVisible, togglePivotGroupCollapse } from '../functions/pivot-group-collapse'

// Models
import type { PivotRow } from '../models/pivot-row.model'
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'
import type { PivotFilter } from '../models/pivot-filter.model'

export const PIVOT_ID_KEY = Symbol('__pivotId')

type IConfig<T extends IItem = IItem> = {
  props?: IPivotProps<T>
  injectionKey?: string
}

function createStore<T extends IItem = IItem>(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig<T>) => {
    const { props } = payload ?? {}

    // Configs
    const loadData = ref(props?.loadData)
    const collapseConfig = ref(props?.collapseConfig) as Ref<IPivotProps<T>['collapseConfig']>
    const config = ref(props?.config) as Ref<IPivotProps<T>['config']>
    const ui = ref(props?.ui)

    // Utils
    const instance = getCurrentInstance()

    const { isLoading, fn } = useFn({
      source: { type: 'store', name: 'pivot' },
    })

    // Layout
    const pivotEl = ref<HTMLElement>()
    const rowHeaderEl = ref<HTMLElement>()
    const valueHeaderEl = ref<HTMLElement>()
    const rowsVirtualScrollEl = ref<{ rerender: (noEmit?: boolean, resetHeights?: boolean) => void }>()
    const valuesVirtualScrollEl = ref<{ rerender: (noEmit?: boolean, resetHeights?: boolean) => void }>()
    const rowsWrapperEl = ref<HTMLElement>()
    const isFirstRender = shallowRef(true)
    const minimumColumnWidth = toRef(props ?? {}, 'minimumColumnWidth', 80)

    const state = ref<IPivotState>({
      collapsedGroupIds: new Set<string>(),
    })

    // Pivot config
    const sourceData = initRef({
      propName: 'data',
      instance,
      props,
      defaultValue: [],
    }) as Ref<T[]>

    const rows = initRef({
      propName: 'rows',
      instance,
      props,
      defaultValue: [],
    }) as Ref<PivotRow<T>[]>

    const columns = initRef({
      propName: 'columns',
      instance,
      props,
      defaultValue: [],
    }) as Ref<PivotColumn<T>[]>

    const values = initRef({
      propName: 'values',
      instance,
      props,
      defaultValue: [],
    }) as Ref<PivotValue<T>[]>

    const filters = initRef({
      propName: 'filters',
      instance,
      props,
      defaultValue: [],
    }) as Ref<PivotFilter<T>[]>

    // Data
    const data = ref<IPivotDataItem<T>[]>([])
    const valueColumns = ref<IPivotValueColumnItem<T>[]>([])
    const valueHeaderRows = ref<IPivotValueHeaderCell[][]>([])

    const totalRows = shallowRef<number>()

    const visibleData = computed(() => {
      const visible = (data.value as IPivotDataItem<T>[]).filter(row => {
        return isPivotRowVisible(row, state.value.collapsedGroupIds)
      })

      return applyPivotEmptyRows(visible, {
        useEmptyRow: config.value?.useEmptyRow,
        rowFieldCount: rows.value.length,
        collapsedGroupIds: state.value.collapsedGroupIds,
        rowFields: rows.value,
        valueColumns: valueColumns.value as IPivotValueColumnItem<T>[],
      })
    })

    function toggleGroupCollapse(groupId: string) {
      state.value.collapsedGroupIds = togglePivotGroupCollapse(state.value.collapsedGroupIds, groupId)
    }

    function recomputeData() {
      const result = pivotTransformData({
        data: sourceData.value,
        rows: rows.value,
        columns: columns.value,
        values: values.value,
        collapseConfig: collapseConfig.value,
        state: state.value,
        isFirstRender,
      })

      data.value = result.data
      valueColumns.value = result.valueColumns
      valueHeaderRows.value = result.valueHeaderRows
    }

    async function fetchAndSetData() {
      const res = await pivotFetchData({ getStore: () => returnedData })

      sourceData.value = res.items
      totalRows.value = !isNil(res.totalRows)
        ? res.totalRows
        : isNil(totalRows.value) ? data.value.length : totalRows.value

      recomputeData()
    }

    watch([rows, columns, values, sourceData], () => {
      recomputeData()
    })

    recomputeData()

    const returnedData = {
      // Configs
      loadData,
      collapseConfig,
      config,
      ui,

      // Utils
      isLoading,
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

      // Data fetching
      fetchAndSetData,
      recomputeData,
      toggleGroupCollapse,

      // Pivot config
      rows,
      columns,
      values,
      filters,

      // Data
      data,
      sourceData,
      visibleData,
      valueColumns,
      valueHeaderRows,
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

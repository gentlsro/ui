<script setup lang="ts">
import { getActivePinia } from 'pinia'

// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableEmits } from './types/table-emits.type'
import type { TableFeature } from './types/table-feature.type'
import type { IQueryBuilderRow } from '../QueryBuilder/types/query-builder-row-props.type'

// Provide / Inject
import { tableSlotsKey } from './provide/table.provide'

// Functions
import { tableInitialize } from './functions/table-initialize'
import { tableGetExposed } from './functions/table-get-exposed'
import { tableGetStorageKey } from './functions/table-get-storage-key'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Stores
import { tableIdKey, tableStorageKey, useTableStore } from './stores/table.store'

const props = withDefaults(defineProps<ITableProps>(), {
  ...getComponentProps('table'),
})

const emits = defineEmits<ITableEmits>()

const slots = useSlots()

provideLocal(tableSlotsKey, slots)

// Init
const self = getCurrentInstance()
const uuid = injectLocal(tableIdKey, useId())
const storageKey = injectLocal(
  tableStorageKey,
  tableGetStorageKey(props.storageKey, self) ?? useId(),
)

provideLocal(tableIdKey, uuid)
provideLocal(tableStorageKey, storageKey)

const mergedProps = computed(() => {
  return getComponentMergedProps('table', props)
})

// Layout
const search = defineModel<string>('search', { default: '' })
const rows = defineModel<IItem[]>('rows', { default: () => [] })
const queryBuilder = defineModel<IQueryBuilderRow[]>('queryBuilder', { default: () => [] })
const selection = defineModel<ITableProps['selection']>('selection')
const isLoading = defineModel<boolean>('isLoading', { default: false })

const tableClass = computed(() => {
  return [
    mergedProps.value?.ui?.containerClass,
    `separator--${props.separator}`,
    { 'is-bordered': props.bordered },
  ]
})

// Stores
const store = useTableStore({ tableProps: { ...props, ...mergedProps.value } })
const {
  headerEl,
  totalsEl,
  tableEl,
  rows: rowsStore,
  emptyValue,
  allowComparatorsOfSameType,
  minimumColumnWidth,
  autofitConfig,
  paginationConfig,
  features,
  selection: selectionStore,
  selectionConfig,
  rowKey,
  propsColumns,
  loadMetaData,
  modifiers,
  queryBuilderProps,
  queryBuilder: queryBuilderStore,
  search: searchStore,
  visibleColumns,
  isMetaLoading,
  splitRowsConfig,
  breakpoint,
  loadData,
  rowsLimit,
  customData,
  isInitialLoad,
  isDataLoading,
  emits: storeEmits,
  rowClickable,
  initialSchemaConfig,
  uiConfig,
} = storeToRefs(store)

// Set emits
storeEmits.value = {
  rowClick: (payload: { ev?: MouseEvent, row: any }) => emits('click:row', payload),
}

// Sync refs with store
syncRef(toRef(props, 'rowKey'), rowKey, { direction: 'ltr' })
syncRef(toRef(props, 'columns', []), propsColumns, { direction: 'ltr' })
syncRef(toRef(props, 'emptyValue'), emptyValue, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadMetaData'), loadMetaData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), loadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'modifiers'), modifiers, { direction: 'ltr', immediate: false })
syncRef(toRef(mergedProps.value, 'queryBuilderProps'), queryBuilderProps, { direction: 'ltr' })
syncRef(toRef(props, 'allowComparatorsOfSameType'), allowComparatorsOfSameType, { direction: 'ltr' })
syncRef(rows, rowsStore, { direction: 'both' })
syncRef(toRef(props, 'minimumColumnWidth'), minimumColumnWidth, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'autoFit'), autofitConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'paginationConfig', {}), paginationConfig, { direction: 'ltr' })
syncRef(queryBuilder, queryBuilderStore, { direction: 'both', immediate: false })
syncRef(search, searchStore, { direction: 'both' })
syncRef(toRef(props, 'features'), features, { direction: 'ltr' })
syncRef(selection, selectionStore, { direction: 'both' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), selectionConfig, { direction: 'ltr' })
syncRef(toRef(props, 'splitRows', []), splitRowsConfig, { direction: 'ltr' })
syncRef(toRef(props, 'breakpoint', 0), breakpoint, { direction: 'ltr' })
syncRef(toRef(props, 'rowsLimit'), rowsLimit, { direction: 'ltr' })
syncRef(isLoading, isDataLoading, { direction: 'both' })
syncRef(toRef(props, 'rowClickable'), rowClickable, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'initialSchemaConfig'), initialSchemaConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'ui'), uiConfig, { direction: 'ltr', immediate: false })

// When columns change, make sure to get their real widths
watch(visibleColumns, cols => {
  nextTick(() => {
    cols.forEach(col => col._width = col.getWidth())

    // Idk, it just requires a second tick re-measure the scrollbars
    nextTick(() => {
      headerEl.value?.measure()
      totalsEl.value?.measure()
    })
  })
})

const hasTop = computed(() => {
  const TOP_FEATURES = [
    'queryBuilderDialog',
    'queryBuilder',
    'filterChips',
    'search',
    'export',
  ] as TableFeature[]

  return TOP_FEATURES.some(feature => props.features?.includes(feature))
})

const hasToolbar = computed(() => {
  const TOOLBAR_FEATURES = [
    'selection',
    'sorting',
    'autofit',
    'columnSelection',
    'layouts',
  ] as TableFeature[]

  return TOOLBAR_FEATURES.some(feature => props.features?.includes(feature))
})

tableInitialize()
defineExpose(tableGetExposed())

// On mount, we get the column' real widths
onMounted(() => {
  nextTick(() => {
    visibleColumns.value.forEach(col => col._width = col.getWidth())
  })
})

// We need to reset the store when the component is unmounted
onUnmounted(() => {
  store.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[store.$id]
})
</script>

<template>
  <div
    ref="tableEl"
    class="table"
    :class="tableClass"
  >
    <!-- Top -->
    <slot
      name="top"
      :ui="mergedProps.ui"
      :query-builder-props="mergedProps.queryBuilderProps"
      :features
      :custom-data
    >
      <TableTop
        v-if="hasTop"
        v-model:search="search"
        v-model:query-builder="queryBuilder"
        :query-builder-props="mergedProps.queryBuilderProps"
        :features
        :ui="mergedProps.ui"
      />
    </slot>

    <!-- Toolbar -->
    <slot
      name="toolbar"
      :ui="mergedProps.ui"
      :features
      :custom-data
    >
      <TableToolbar
        v-if="hasToolbar"
        :features
        :ui="mergedProps.ui"
      >
        <template #selection-menu="{ selection }">
          <slot
            name="selection-menu"
            :selection
          />
        </template>
      </TableToolbar>
    </slot>

    <!-- Header -->
    <slot
      name="header"
      :ui="mergedProps.ui"
      :custom-data
    >
      <TableHeader
        v-if="!noHeader"
        :ui="mergedProps.ui"
      />
    </slot>

    <!-- Content -->
    <TableContent
      v-if="rows?.length && !isMetaLoading"
      :ui="mergedProps.ui"
      :editable
      :to
    >
      <!-- Cell slots -->
      <template
        v-for="col in visibleColumns"
        :key="col.name"
        #[col.name]="{ row, column, index }"
      >
        <slot
          :name="col.name"
          :row
          :index
          :custom-data
          :column
        />
      </template>

      <!-- Row slot -->
      <template #row="{ row, index }">
        <slot
          name="row"
          :row
          :index
          :custom-data
        />
      </template>

      <!-- Row inside slot -->
      <template #row-inside="rowInsideProps">
        <slot
          name="row-inside"
          v-bind="rowInsideProps"
          :custom-data
        />
      </template>
    </TableContent>

    <!-- Loading -->
    <TableLoading v-else-if="isInitialLoad" />

    <!-- Empty -->
    <TableEmpty v-else />

    <!-- Totals -->
    <TableTotals
      :totals
      :ui="mergedProps.ui"
    />

    <!-- Bottom -->
    <TableBottom />

    <!-- Default slot to be used for custom content (most likely absolutely positioned) -->
    <slot />
  </div>
</template>

<style scoped lang="scss">
.table {
  @apply flex flex-col overflow-auto grow @container;
}
</style>

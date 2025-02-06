<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { IQueryBuilderRow } from '../QueryBuilder/types/query-builder-row-props.type'

// Provide / Inject
import { tableIdKey, tableSlotsKey } from './provide/table.provide'

// Functions
import { tableGetExposed } from './functions/table-get-exposed'
import { tableGetStorageKey } from './functions/table-get-storage-key'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Stores
import { useTableStore } from './stores/table.store'
import { tableInitialize } from './functions/table-initialize'

const props = withDefaults(defineProps<ITableProps>(), {
  ...getComponentProps('table'),
})

const slots = useSlots()

provideLocal(tableSlotsKey, slots)

// Init
const self = getCurrentInstance()
const uuid = injectLocal(tableIdKey, tableGetStorageKey(props.storageKey, self) ?? useId())

provideLocal(tableIdKey, uuid)

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
} = storeToRefs(store)

// Sync refs with store
syncRef(toRef(props, 'rowKey'), rowKey, { direction: 'ltr' })
syncRef(toRef(props, 'columns', []), propsColumns, { direction: 'ltr' })
syncRef(toRef(props, 'emptyValue'), emptyValue, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadMetaData'), loadMetaData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), loadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'modifiers'), modifiers, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'queryBuilderProps'), queryBuilderProps, { direction: 'ltr' })
syncRef(toRef(props, 'allowComparatorsOfSameType'), allowComparatorsOfSameType, { direction: 'ltr' })
syncRef(rows, rowsStore, { direction: 'both' })
syncRef(toRef(props, 'minimumColumnWidth'), minimumColumnWidth, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'autoFit'), autofitConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'paginationConfig', {}), paginationConfig, { direction: 'ltr' })
syncRef(queryBuilder, queryBuilderStore, { direction: 'both' })
syncRef(search, searchStore, { direction: 'both' })
syncRef(toRef(props, 'features'), features, { direction: 'ltr' })
syncRef(selection, selectionStore, { direction: 'both' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), selectionConfig, { direction: 'ltr' })
syncRef(toRef(props, 'splitRows', []), splitRowsConfig, { direction: 'ltr' })
syncRef(toRef(props, 'breakpoint', 0), breakpoint, { direction: 'ltr' })
syncRef(toRef(props, 'rowsLimit'), rowsLimit, { direction: 'ltr' })
syncRef(isLoading, isDataLoading, { direction: 'both' })

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

tableInitialize()

defineExpose(tableGetExposed())

// We need to reset the initial load flag on unmounting
onUnmounted(() => {
  isInitialLoad.value = true
})
</script>

<template>
  <div
    ref="tableEl"
    class="table"
    :class="tableClass"
  >
    <slot
      name="top"
      :ui="mergedProps.ui"
      :query-builder-props="mergedProps.queryBuilderProps"
      :features
      :custom-data
    >
      <TableTop
        v-model:search="search"
        v-model:query-builder="queryBuilder"
        :query-builder-props="mergedProps.queryBuilderProps"
        :features
        :ui="mergedProps.ui"
      />
    </slot>

    <slot
      name="toolbar"
      :ui="mergedProps.ui"
      :features
      :custom-data
    >
      <TableToolbar
        :features
        :ui="mergedProps.ui"
      >
        <template #selection-menu>
          <slot name="selection-menu" />
        </template>
      </TableToolbar>
    </slot>

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

    <TableLoading v-else-if="isInitialLoad" />

    <TableEmpty v-else />

    <TableTotals
      v-if="totals?.length"
      :totals
      :ui="mergedProps.ui"
    />

    <TableBottom />
  </div>
</template>

<style scoped lang="scss">
.table {
  @apply flex flex-col overflow-auto grow;
}
</style>

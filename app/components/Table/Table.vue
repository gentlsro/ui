<script setup lang="ts">
// Utils
import { isObject } from 'lodash-es'

// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableEmits } from './types/table-emits.type'

// Provide / Inject
import { tableSlotNamesKey, tableSlotsKey } from './provide/table.provide'

// Functions
import { tableInitialize } from './functions/table-initialize'
import { tableGetExposed } from './functions/table-get-exposed'
import { tableGetStorageKey } from './functions/table-get-storage-key'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'
import { TABLE_EXPORTS_DEFAULT } from './constants/table-exports-default.constant'

// Stores
import { useTableStore } from './stores/table.store'

const props = withDefaults(defineProps<ITableProps>(), {
  ...getComponentProps('table'),
})

const emits = defineEmits<ITableEmits>()

const slots = useSlots()

function hasRowActions() {
  if (store.isCardView.value) {
    return false
  }

  if (slots['row-actions']) {
    return true
  }

  if (store.isEditingCell.value) {
    return store.cellEditMode.value === 'row'
  }

  const editable = props.editable

  return isObject(editable) && editable.mode === 'row' && editable.view !== 'card'
}

provideLocal(tableSlotsKey, slots)

// Rows render the cell / row slots straight from `slots`: forwarding them through
// `TableContent` made them dynamic slots, which forced every mounted row to re-render
// on each scroll. `slots` is not reactive, so its names are, for slots added later.
const slotNames = shallowRef(Object.keys(slots))

onBeforeUpdate(() => {
  const names = Object.keys(slots)

  if (names.join() !== slotNames.value.join()) {
    slotNames.value = names
  }
})

provideLocal(tableSlotNamesKey, slotNames)

// Init
const self = getCurrentInstance()
const storageKey = computed(() => tableGetStorageKey(props.storageKey, self))

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
    mergedProps.value?.ui?.containerClass?.({
      defaults: TABLE_DEFAULT_PROPS.ui.containerClass(),
    }),
    `separator--${props.separator}`,
    {
      'is-bordered': props.bordered,
      'can-scroll-left': !store.scrollArrivedState.left,
      'can-scroll-right': !store.scrollArrivedState.right,
    },
  ]
})

// Stores
const store = useTableStore({
  tableProps: { ...props, ...mergedProps.value },
  storageKey,
})

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
  exportData,
  isInitialLoad,
  isDataLoading,
  emits: storeEmits,
  rowClickable,
  initialSchemaConfig,
  uiConfig,
} = store

// Set emits
storeEmits.value = {
  rowClick: (payload: { ev?: MouseEvent, row: any }) => emits('click:row', payload),
  columnResize: (payload: { column: TableColumn<any>, columns: TableColumn<any>[], width: number }) => emits('resize:column', payload),
}

// Sync refs with store
const loadDataRef = computed(() => mergedProps.value.loadData)
const loadMetaDataRef = computed(() => mergedProps.value.loadMetaData)
const modifiersRef = computed(() => mergedProps.value.modifiers)
const queryBuilderPropsRef = computed(() => mergedProps.value.queryBuilderProps)
const selectionConfigRef = computed(() => mergedProps.value.selectionConfig)
const autofitConfigRef = computed(() => mergedProps.value.autoFit)

syncRef(toRef(props, 'rowKey'), rowKey, { direction: 'ltr' })
syncRef(toRef(props, 'columns', []), propsColumns, { direction: 'ltr' })
syncRef(toRef(props, 'emptyValue'), emptyValue, { direction: 'ltr' })
syncRef(loadMetaDataRef, loadMetaData, { direction: 'ltr' })
syncRef(loadDataRef, loadData, { direction: 'ltr' })
syncRef(modifiersRef, modifiers, { direction: 'ltr', immediate: false })
syncRef(toRef(props, 'exportData', TABLE_EXPORTS_DEFAULT), exportData, { direction: 'ltr' })
syncRef(queryBuilderPropsRef, queryBuilderProps, { direction: 'ltr' })
syncRef(toRef(props, 'allowComparatorsOfSameType'), allowComparatorsOfSameType, { direction: 'ltr' })
syncRef(rows, rowsStore, { direction: 'both' })
syncRef(toRef(props, 'minimumColumnWidth'), minimumColumnWidth, { direction: 'ltr' })
syncRef(autofitConfigRef, autofitConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'paginationConfig', {}), paginationConfig, { direction: 'ltr' })
syncRef(queryBuilder, queryBuilderStore, { direction: 'both', immediate: false, deep: true })
syncRef(search, searchStore, { direction: 'both' })
syncRef(toRef(props, 'features'), features, { direction: 'ltr' })
syncRef(selection, selectionStore, { direction: 'both' })
syncRef(selectionConfigRef, selectionConfig, { direction: 'ltr' })
syncRef(toRef(props, 'splitRows', []), splitRowsConfig, { direction: 'ltr' })
syncRef(toRef(props, 'breakpoint', 0), breakpoint, { direction: 'ltr' })
syncRef(toRef(props, 'rowsLimit'), rowsLimit, { direction: 'ltr' })
syncRef(isLoading, isDataLoading, { direction: 'both' })
syncRef(toRef(props, 'rowClickable'), rowClickable, { direction: 'ltr' })
syncRef(toRef(() => mergedProps.value.initialSchemaConfig), initialSchemaConfig, { direction: 'ltr' })
syncRef(toRef(() => mergedProps.value.ui), uiConfig, { direction: 'ltr', immediate: false })

// When columns or their resolved widths change, make sure to get their real widths
watch([visibleColumns, () => visibleColumns.value.map(store.getColumnWidth)], ([cols]) => {
  nextTick(() => {
    cols.forEach(col => col._width = col.getWidth(unrefElement(tableEl.value) ?? document))

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
    visibleColumns.value.forEach(col => col._width = col.getWidth(unrefElement(tableEl.value) ?? document))
  })
})
</script>

<template>
  <div
    ref="tableEl"
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
        v-model:query-builder="queryBuilderStore"
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
        <template #selection-menu="{ selection: selectionValue }">
          <slot
            name="selection-menu"
            :selection="selectionValue"
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
        :freeze
        :has-row-actions="hasRowActions()"
      />
    </slot>

    <!-- Content -->
    <TableContent
      v-if="rows?.length && !isMetaLoading"
      :ui="mergedProps.ui"
      :editable
      :freeze
      :to
      :to-link-props="mergedProps.toLinkProps"
      :show-copy-btn
      :scroller-config="mergedProps.scrollerConfig"
    >
      <!-- Row slot -->
      <template #row="{ row, index }">
        <slot
          name="row"
          :row
          :index
          :custom-data
        />
      </template>

      <!-- Cell, `row-actions` and `row-inside` slots are rendered by the rows themselves -->
    </TableContent>

    <!-- Empty -->
    <slot
      v-else
      name="empty"
    >
      <TableEmpty />
    </slot>

    <!-- Totals -->
    <slot
      name="totals"
      :ui="mergedProps.ui"
    >
      <TableTotals
        :totals
        :has-row-actions="hasRowActions()"
        :ui="mergedProps.ui"
      />
    </slot>

    <!-- Bottom -->
    <slot name="bottom">
      <TableBottom :ui="mergedProps.ui">
        <template #loading>
          <slot
            name="bottom-loading"
            :is-data-loading
            :is-meta-loading
          />
        </template>
      </TableBottom>
    </slot>

    <!-- Loading -->
    <TableLoading v-if="isInitialLoad" />

    <!-- Default slot to be used for custom content (most likely absolutely positioned) -->
    <slot />
  </div>
</template>

<style scoped lang="scss">
// Bordered tables frame the header, rows and totals as one rounded block
.is-bordered {
  --table-frame-border: #e5e5e5;

  > :deep(.table-header),
  > :deep(.table-content),
  > :deep(.table-empty),
  > :deep(.table-totals) {
    @apply m-x-3 border-x-1 border-solid;

    border-color: var(--table-frame-border);
  }

  > :deep(.table-header) {
    @apply border-t-1 rounded-t-lg;
  }

  // Whichever block comes last closes the frame
  > :deep(:is(.table-content, .table-empty, .table-totals):not(:has(+ .table-totals))) {
    @apply border-b-1 rounded-b-lg m-b-2;
  }

  > :deep(.table-bottom) {
    @apply border-t-0;
  }
}

.dark .is-bordered {
  --table-frame-border: #262626;
}
</style>

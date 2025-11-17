<script setup lang="ts">
import { getActivePinia } from 'pinia'
import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

// Types
import type { IListItem } from './types/list-item.type'
import type { IListEmits } from './types/list-emits.type'
import type { IListSlots } from './types/list-slots.type'
import type { IListProps } from './types/list-props.type'
import type { IListItemToAdd } from './types/list-item-to-add.type'

// Functions
import { listGetExposed } from './functions/list-get-exposed'
import { useListItemAdding } from './composables/useListItemAdding'
import { getListItemKey } from './functions/helpers/get-list-item-key'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { listIdKey, useListStore } from './stores/list.store'

const props = withDefaults(defineProps<IListProps>(), {
  ...getComponentProps('list'),
  listId: () => useId(),
})

const emits = defineEmits<IListEmits>()
defineSlots<IListSlots>()

// Utils
const uuid = props.listId ?? injectLocal(listIdKey, useId()) as string

const mergedProps = computed(() => {
  return getComponentMergedProps('list', props)
})

provideLocal(listIdKey, uuid)

// Store
const listStore = useListStore(uuid, props)
const {
  isFirstFetch,
  containerEl,
  items: storeItems,
  listItems,
  searchConfig: storeSearchConfig,
  sortingConfig: storeSortingConfig,
  itemFocusedIdx,
  loadData: storeLoadData,
  noFilter: storeNoFilter,
  addedItems: storeAddedItems,
  addConfig: storeAddConfig,
  emits: storeEmits,
  selection: storeSelection,
  isLoadingSource,
  search: storeSearch,
  isMounted: isMountedStore,
  isClearable: storeIsClearable,
  hiddenItems: storeHiddenItems,
  modifiers,
  listEl,
} = storeToRefs(listStore)

// Set emits
storeEmits.value = {
  select: (item: IListItem) => emits('select:item', item),
  unselect: (item: IListItem) => emits('unselect:item', item),
  add: (item: IListItemToAdd) => emits('add:item', item),
  remove: (item: IListItemToAdd) => emits('remove:item', item),
  itemClick: (row: IListItem) => emits('click:item', row),
  groupClick: (row: IGroupRow) => emits('click:group', row),
  itemMoved: (item, items) => emits('move:item', { item, items }),
}

// Layout
const search = defineModel<string>('search')
const isMounted = ref(false)
const addedItems = defineModel<IListItemToAdd[]>('addedItems', {
  default: () => [],
})
const selection = defineModel<IListProps['selection']>('selection')
const items = defineModel<IItem[]>('items') as Ref<IItem[]>

const isSearchInputVisible = computed(() => {
  if (props.noFilter && !mergedProps.value.loadData?.fnc) {
    return false
  }

  return mergedProps.value.searchConfig?.enabled && !mergedProps.value.searchConfig?.hidden
})

// Sync with store
syncRef(addedItems, storeAddedItems, { direction: 'both' })
syncRef(toRef(props, 'noFilter'), storeNoFilter, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'addConfig'), storeAddConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), storeLoadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'searchConfig'), storeSearchConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'sortingConfig'), storeSortingConfig, { direction: 'ltr' })
syncRef(selection, storeSelection, { direction: 'both', immediate: false })
syncRef(items, storeItems, { direction: 'both', immediate: false })
syncRef(toRef(props, 'loading'), isLoadingSource, { direction: 'ltr' })
syncRef(toRef(props, 'clearable'), storeIsClearable, { direction: 'ltr' })
syncRef(search, storeSearch, { direction: 'both' })
syncRef(isMounted, isMountedStore, { direction: 'ltr' })
syncRef(toRef(props, 'hiddenItems'), storeHiddenItems, { direction: 'ltr' })
syncRef(toRef(props, 'modifiers'), modifiers, { direction: 'ltr' })

// Adding
useListItemAdding()

// Initial load data
const isImmediate = mergedProps.value.loadData?.immediate !== false
  && (!props.items || !props.items.length)

// We load data immediately if required
if (mergedProps.value.loadData?.fnc && isImmediate) {
  listStore.fetchAndSetData()
    .then(() => isFirstFetch.value = false)
}

// Otherwise, we just trigger the watcher
else if (storeItems.value) {
  storeItems.value = [...storeItems.value]
  isFirstFetch.value = false
}

// We want to scroll to the selected item when the list is mounted
onMounted(() => {
  const _selection = Array.isArray(selection.value)
    ? selection.value
    : [selection.value].filter(Boolean)

  if (_selection.length === 1) {
    requestAnimationFrame(() => {
      const itemKey = getListItemKey(_selection[0], props.itemKey)
      const itemIdx = listItems.value?.findIndex(item => item.id === itemKey)
      itemFocusedIdx.value = itemIdx

      listEl.value?.scrollTo(itemIdx)
    })
  }
})

// Dispose of store on unmount
onUnmounted(() => {
  listStore.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[listStore.$id]
})

defineExpose(listGetExposed())
</script>

<template>
  <div
    ref="containerEl"
    class="list"
    :class="[ui?.containerClass, { 'is-dense': dense }]"
    :style="ui?.containerStyle"
    @mouseleave="itemFocusedIdx = -1"
  >
    <!-- Search -->
    <slot
      name="search"
      :ui="mergedProps.ui"
    >
      <ListSearch
        v-if="isSearchInputVisible"
        v-model:search="search"
        :search-input-props="mergedProps.searchInputProps"
        :ui="mergedProps.ui"
      />
    </slot>

    <!-- Above -->
    <slot
      name="above"
      :list-items
      :items
    />

    <!-- Content -->
    <slot
      name="content"
      :ui="mergedProps.ui"
      :scroller-config="mergedProps.scrollerConfig"
    >
      <ListContent
        :no-hover
        :reorderable
        :disabled-fnc
        :ui="mergedProps.ui"
        :scroller-config="mergedProps.scrollerConfig"
        :move-handle-target
        @change:content-size="$emit('change:contentSize', $event)"
      >
        <template #item="itemData">
          <slot
            name="item"
            v-bind="itemData"
          />
        </template>

        <template #move-handle>
          <slot name="move-handle" />
        </template>
      </ListContent>
    </slot>

    <!-- No data -->
    <slot name="noData">
      <ListNoData
        @change:content-size="$emit('change:contentSize', $event)"
      />
    </slot>

    <!-- Loading -->
    <slot name="loading">
      <ListLoading />
    </slot>

    <slot
      name="below"
      :list-items
      :items
    />
  </div>
</template>

<style lang="scss" scoped>
.list {
  @apply flex flex-col overflow-auto rounded-custom;
}
</style>

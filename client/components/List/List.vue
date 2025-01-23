<script setup lang="ts">
import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

// Types
import type { IListItem } from './types/list-item.type'
import type { IListEmits } from './types/list-emits.type'
import type { IListSlots } from './types/list-slots.type'
import type { IListProps } from './types/list-props.type'
import type { IListItemToAdd } from './types/list-item-to-add.type'

// Functions
import { useListItemAdding } from './composables/useListItemAdding'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { listIdKey, useListStore } from './stores/list.store'
import { useListKeyboard } from './composables/useListKeyboard'

const props = withDefaults(defineProps<IListProps>(), {
  ...getComponentProps('list'),
})

const emits = defineEmits<IListEmits>()
defineSlots<IListSlots>()

// Utils
const { handleKey } = useListKeyboard()
const uuid = injectLocal(listIdKey, useId()) as string

const mergedProps = computed(() => {
  return getComponentMergedProps('list', props)
})

provideLocal(listIdKey, uuid)

// Store
const listStore = useListStore(uuid, props)
const {
  containerEl,
  items: storeItems,
  listItems,
  searchConfig: storeSearchConfig,
  sortingConfig: storeSortingConfig,
  itemFocusedIdx,
  isLoading,
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
} = storeToRefs(listStore)

// Set emits
storeEmits.value = {
  select: (item: IListItem) => emits('select:item', item),
  unselect: (item: IListItem) => emits('unselect:item', item),
  add: (item: IListItemToAdd) => emits('add:item', item),
  remove: (item: IListItemToAdd) => emits('remove:item', item),
  itemClick: (row: IListItem) => emits('click:item', row),
  groupClick: (row: IGroupRow) => emits('click:group', row),
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

  return mergedProps.value.searchConfig?.enabled
})

// Sync with store
syncRef(addedItems, storeAddedItems, { direction: 'both' })
syncRef(toRef(props, 'noFilter'), storeNoFilter, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'addConfig'), storeAddConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), storeLoadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'searchConfig'), storeSearchConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'sortingConfig'), storeSortingConfig, { direction: 'ltr' })
syncRef(selection, storeSelection, { direction: 'both' })
syncRef(items, storeItems, { direction: 'both', immediate: false })
syncRef(toRef(props, 'loading'), isLoadingSource, { direction: 'ltr' })
syncRef(toRef(props, 'clearable'), storeIsClearable, { direction: 'ltr' })
syncRef(search, storeSearch, { direction: 'both' })
syncRef(isMounted, isMountedStore, { direction: 'ltr' })
syncRef(toRef(props, 'hiddenItems'), storeHiddenItems, { direction: 'ltr' })

// Adding
useListItemAdding()

// Initial load data
const isImmediate = mergedProps.value.loadData?.immediate || !props.items || !props.items.length

// We load data immediately if required
if (mergedProps.value.loadData?.fnc && isImmediate) {
  listStore.fetchAndSetData()
}

// Otherwise, we just trigger the watcher
else if (storeItems.value) {
  storeItems.value = [...storeItems.value]
}

defineExpose({ handleKey })
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
    >
      <ListContent
        :no-hover
        :reorderable
        :disabled-fnc
        :ui="mergedProps.ui"
        @change:content-size="$emit('change:contentSize', $event)"
      >
        <template #item="itemData">
          <slot
            name="item"
            v-bind="itemData"
          />
        </template>
      </ListContent>
    </slot>

    <!-- No data -->
    <slot name="noData">
      <ListNoData @change:content-size="$emit('change:contentSize', $event)" />
    </slot>

    <!-- Loading -->
    <slot
      v-if="isLoading && !items?.length"
      name="loading"
    >
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

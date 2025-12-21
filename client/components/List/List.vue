<script setup lang="ts">
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
import { LIST_ID_KEY, useListStore } from './stores/list.store'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

const props = withDefaults(defineProps<IListProps>(), {
  ...getComponentProps('list'),
  listId: () => useId(),
})

const emits = defineEmits<IListEmits>()
defineSlots<IListSlots>()

// Init
const uuid = generateUUID()
provideLocal(LIST_ID_KEY, uuid)

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('list', props)
})

// Store
const listStore = useListStore({ listProps: props })
const {
  // Configs
  addConfig,
  sortingConfig,
  searchConfig,
  loadData,

  // Layout
  listEl,
  search,
  selection,
  isFirstFetch,
  containerEl,
  items: storeItems,
  listItems,
  itemFocusedIdx,
  emits: storeEmits,
  modifiers,
} = listStore

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
const items = defineModel<IItem[]>('items') as Ref<IItem[]>

const isSearchInputVisible = computed(() => {
  if (props.noFilter && !mergedProps.value.loadData?.fnc) {
    return false
  }

  return mergedProps.value.searchConfig?.enabled && !mergedProps.value.searchConfig?.hidden
})

const containerClass = computed(() => {
  return mergedProps.value.ui?.containerClass?.({
    defaults: LIST_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value.ui?.containerStyle?.()
})

// Sync with store
syncRef(items, storeItems, { direction: 'both', immediate: false })

syncRef(toRef(mergedProps.value, 'addConfig'), addConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadData'), loadData, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'searchConfig'), searchConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'sortingConfig'), sortingConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'modifiers'), modifiers, { direction: 'ltr' })

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

defineExpose(listGetExposed())
</script>

<template>
  <div
    ref="containerEl"
    class="list"
    :class="[containerClass, { 'is-dense': dense }]"
    :style="containerStyle"
    @mouseleave="itemFocusedIdx = -1"
  >
    <!-- Search -->
    <slot
      name="search"
      :ui="mergedProps.ui"
      :search-config="mergedProps.searchConfig"
    >
      <ListSearch
        v-if="isSearchInputVisible"
        v-model:search="search"
        :search-config="mergedProps.searchConfig"
        :ui="mergedProps.ui"
        :dense
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
        :dense
        @change:content-size="$emit('change:contentSize', $event)"
      >
        <template #item="itemData">
          <slot
            name="item"
            v-bind="itemData"
          />
        </template>

        <template #item-group="itemData">
          <slot
            name="item-group"
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
        :ui="mergedProps.ui"
        @change:content-size="$emit('change:contentSize', $event)"
      />
    </slot>

    <!-- Loading -->
    <slot name="loading">
      <ListLoading :ui="mergedProps.ui" />
    </slot>

    <slot
      name="below"
      :list-items
      :items
    />
  </div>
</template>

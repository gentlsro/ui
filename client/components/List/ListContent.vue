<script setup lang="ts">
// Types
import type { IListItem } from './types/list-item.type'
import type { IListProps } from './types/list-props.type'
import type { IVirtualScrollEvent } from '../VirtualScroller/types/virtual-scroll-event.type'

// Store
import { useListStore } from './stores/list.store'
import { useListKeyboard } from './composables/useListKeyboard'

type IProps = Pick<IListProps, 'ui' | 'noHover' | 'reorderable' | 'disabledFnc' | 'scrollerConfig' | 'moveHandleTarget'>

const props = defineProps<IProps>()
defineEmits<{
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()

// Constants
const FETCH_MORE_THRESHOLD = 3 // How many items from the bottom to trigger the fetch

// Layout
const listStore = useListStore()
const {
  listEl,
  listItems,
  isDragging,
  isFetchMore,
  searchConfig,
  dragMeta,
} = storeToRefs(listStore)

const { handleMouseOver } = useListKeyboard()

function handleVirtualScroll(ev: IVirtualScrollEvent) {
  if (isDragging.value) {
    return
  }

  const { visibleEndItem } = ev
  const _listItems = listItems.value ?? []
  const isFetchMore = _listItems.length - visibleEndItem.index - 1 < FETCH_MORE_THRESHOLD

  if (isFetchMore) {
    const lastVisibleItem = _listItems[visibleEndItem.index] as IListItem

    listStore.fetchAndSetData({ isFetchMore, lastVisibleItem })
  }
}

const contentClass = computed(() => {
  return props.ui?.contentClass?.(searchConfig.value?.enabled)
})

const contentStyle = computed(() => {
  return props.ui?.contentStyle?.(searchConfig.value?.enabled)
})
</script>

<template>
  <VirtualScroller
    v-if="listItems?.length"
    v-bind="scrollerConfig"
    ref="listEl"
    :rows="listItems"
    class="list-content"
    :fetch-more="isFetchMore"
    :class="contentClass"
    :style="contentStyle"
    @virtual-scroll="handleVirtualScroll"
    @change:content-size="$emit('change:contentSize', $event)"
  >
    <template #default="{ row, index }">
      <slot
        name="item-row"
        :row
        :index
        :ui
        :is-group="'isGroup' in row"
        :is-last="index === listItems.length - 1"
      >
        <!-- Group -->
        <ListRowGroup
          v-if="'isGroup' in row"
          :item="row"
          :ui
        >
          <slot
            name="item-group"
            :row
            :index
          />
        </ListRowGroup>

        <!-- Item -->
        <ListRowItem
          v-else
          :item="row"
          :no-hover
          :reorderable
          :ui
          :is-last="index === listItems.length - 1"
          :disabled-fnc
          :move-handle-target
          @mouseover="handleMouseOver(row, index)"
        >
          <template #default="{ isDisabled }">
            <slot
              name="item"
              :row
              :index
              :is-disabled
            />
          </template>

          <template #move-handle>
            <slot name="move-handle" />
          </template>
        </ListRowItem>
      </slot>
    </template>

    <!-- Drop indicator -->
    <template #inner>
      <ListDropIndicator v-if="dragMeta.isVirtualScroll" />
    </template>
  </VirtualScroller>
</template>

<style lang="scss" scoped>
.list-content {
  @apply grow;
}

.list.is-dense {
  .list-content {
    @apply p-1 p-t-0;
  }
}
</style>

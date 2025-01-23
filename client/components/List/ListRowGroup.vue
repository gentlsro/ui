<script setup lang="ts">
import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

// Types
import type { IListProps } from './types/list-props.type'

// Store
import { useListStore } from './stores/list.store'

type IProps = {
  item: IGroupRow
  ui?: IListProps['ui']
}

const props = defineProps<IProps>()

// Store
const listStore = useListStore()
const { emits, itemFocusedIdx } = storeToRefs(listStore)

// Layout
const item = toRef(props, 'item')

const groupProps = computed(() => {
  return {
    style: props.ui?.rowGroupStyle?.({ group: item.value, level: item.value.groupIdx }),
    class: props.ui?.rowGroupClass?.({ group: item.value, level: item.value.groupIdx }),
  }
})

function handleClick() {
  emits.value.groupClick(item.value)
}
</script>

<template>
  <div
    class="list-row-group"
    :class="groupProps.class"
    :style="groupProps.style"
    :data-id="item.id"
    @mouseenter="itemFocusedIdx = -1"
    @click="handleClick"
  >
    <slot>
      <span class="list-row-group__content">
        {{ item.label }}
      </span>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.list-row-group {
  @apply relative flex gap-x-2 cursor-default select-none items-center p-r-1 min-h-8 w-full;
  @apply capitalize color-true-gray text-sm items-end p-b-0.5;
}
</style>

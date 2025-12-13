<script setup lang="ts">
import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

// Types
import type { IListProps } from './types/list-props.type'

// Store
import { useListStore } from './stores/list.store'

// Constants
import { LIST_DEFAULT_PROPS } from './constants/list-default-props.constant'

type IProps = {
  item: IGroupRow
  ui?: IListProps['ui']
}

const props = defineProps<IProps>()

// Store
const { emits, itemFocusedIdx } = useListStore()

// Layout
const item = toRef(props, 'item')

const rowGroupClass = computed(() => {
  return props.ui?.rowGroupClass?.({
    group: item.value,
    level: item.value.groupIdx,
    defaults: LIST_DEFAULT_PROPS.ui.rowGroupClass(),
  })
})

const rowGroupStyle = computed(() => {
  return props.ui?.rowGroupStyle?.({ group: item.value, level: item.value.groupIdx })
})

function handleClick() {
  emits.value.groupClick(item.value)
}
</script>

<template>
  <div
    class="list-row-group"
    :class="rowGroupClass"
    :style="rowGroupStyle"
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

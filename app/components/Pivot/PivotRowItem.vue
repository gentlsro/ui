<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItem } from './types/pivot-row-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotRowItem<T>
  groupIds: string[]
}

const props = defineProps<IProps>()

const { ui } = usePivotStore()

// Styles - row item
const rowItemClass = computed(() => {
  return [
    ui.value?.rowItemClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.rowItemClass(),
    }),
    {
      'is-subtotal': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
      'is-empty-row': props.item.kind === 'emptyRow',
    },
  ]
})

const rowItemStyle = computed(() => {
  return ui.value?.rowItemStyle?.()
})
</script>

<template>
  <div
    class="pivot-row-item"
    :class="rowItemClass"
    :style="rowItemStyle"
  >
    <PivotRowItemCell
      v-for="cell in item.cells"
      :key="cell.id"
      :item="cell"
    />
  </div>
</template>

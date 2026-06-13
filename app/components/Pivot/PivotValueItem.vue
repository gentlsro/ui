<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItem } from './types/pivot-value-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItem<T>
}

const props = defineProps<IProps>()

const { state, valueColumns, ui } = usePivotStore()

const displayedItem = computed(() => {
  const collapsedItems = props.item.collapsedGroupValueItems

  if (!collapsedItems) {
    return props.item
  }

  const groupId = props.item.groupIds.find(groupId => {
    return state.value.collapsedGroupIds.has(groupId)
      && collapsedItems[groupId]
  })

  return groupId ? collapsedItems[groupId]! : props.item
})

const valueItemClass = computed(() => {
  return [
    ui.value?.valueItemClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueItemClass(),
    }),
    {
      'is-subtotal': displayedItem.value.kind === 'subtotal',
      'is-grand-total': displayedItem.value.kind === 'grandTotal',
      'is-empty-row': displayedItem.value.kind === 'emptyRow',
    },
  ]
})

const valueItemStyle = computed(() => {
  const totalWidth = valueColumns.value.reduce((sum, column) => {
    return sum + (Number.parseFloat(column.width) || 0)
  }, 0)

  return {
    ...ui.value?.valueItemStyle?.(),
    minWidth: totalWidth ? `${totalWidth}px` : undefined,
    width: totalWidth ? `${totalWidth}px` : undefined,
  }
})
</script>

<template>
  <div
    class="pivot-value-item"
    :class="valueItemClass"
    :style="valueItemStyle"
  >
    <PivotValueItemCell
      v-for="cell in displayedItem.cells"
      :key="cell.id"
      :item="cell"
    />
  </div>
</template>

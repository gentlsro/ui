<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItem } from './types/pivot-value-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'

// Functions
import {
  resolvePivotDisplayedValueCells,
  resolvePivotDisplayedValueItem,
} from './functions/pivot-resolve-value-item'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItem<T>
  row: IPivotDataItem<T>
}

const props = defineProps<IProps>()

const { state, visibleValueColumns, ui } = usePivotStore<T>()

const displayedItem = computed(() => {
  return resolvePivotDisplayedValueItem({
    item: props.item,
    collapsedGroupIds: state.value.collapsedGroupIds,
  })
})

const displayedCells = computed(() => {
  return resolvePivotDisplayedValueCells({
    item: props.item,
    visibleValueColumns: visibleValueColumns.value,
    collapsedGroupIds: state.value.collapsedGroupIds,
  })
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
  const totalWidth = visibleValueColumns.value.reduce((sum, column) => {
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
      v-for="(cell, index) in displayedCells"
      :key="cell.id"
      :item="cell"
      :column="visibleValueColumns[index]!"
      :row
    />
  </div>
</template>

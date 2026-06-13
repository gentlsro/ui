<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItemCell<T>
}

const props = defineProps<IProps>()

const { valueColumns, ui } = usePivotStore()

const column = computed(() => {
  return valueColumns.value.find(col => col.id === props.item.columnId)
})

const valueItemCellClass = computed(() => {
  return [
    ui.value?.valueItemCellClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueItemCellClass(),
    }),
    {
      'is-total': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
    },
  ]
})

const valueItemCellStyle = computed(() => {
  const valueItemCellStyle = ui.value?.valueItemCellStyle?.()
  const width = column.value?.width ?? props.item.value.widthResolved

  return Object.assign({}, valueItemCellStyle, { width })
})
</script>

<template>
  <div
    class="pivot-value-item-cell"
    :class="valueItemCellClass"
    :style="valueItemCellStyle"
    :data-pivot-value-column="item.columnId"
  >
    <span
      v-if="item.formattedValue !== ''"
      class="truncate"
    >
      {{ item.formattedValue }}
    </span>
  </div>
</template>

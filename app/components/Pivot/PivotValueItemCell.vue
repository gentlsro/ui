<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem } from './types/pivot-value-column-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItemCell<T>
  column: IPivotValueColumnItem<T>
}

const props = defineProps<IProps>()

const { ui } = usePivotStore()
const { formatNumber } = useNumber()

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
  const width = props.column.width ?? props.item.value.widthResolved

  return Object.assign({}, valueItemCellStyle, { width })
})

const formattedValue = computed(() => {
  if (!props.item.hasValue || !Number.isFinite(props.item.aggregated)) {
    return ''
  }

  return formatNumber(props.item.aggregated)
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
      v-if="formattedValue !== ''"
      class="truncate"
    >
      {{ formattedValue }}
    </span>
  </div>
</template>

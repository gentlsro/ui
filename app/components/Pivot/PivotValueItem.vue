<script setup lang="ts" vapor generic="T extends IItem = IItem">
// Types
import type { IPivotValueItem } from './types/pivot-value-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'
import type { IPivotValueColumnItem } from './types/pivot-value-column-item.type'

// Functions
import { resolvePivotDisplayedValueCells } from './functions/pivot-resolve-value-item'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: IPivotValueItem<T>
  row: IPivotDataItem<T>

  /**
   * The rendered slice of `visibleValueColumns` when the scroller virtualizes columns; the scroller then pads
   * the row to the full width
   */
  columns?: IPivotValueColumnItem<T>[]
}

const props = defineProps<IProps>()

const {
  valueLayout,
  visibleValueColumns,
  visibleValueColumnsWidthPx,
  valueItemUiClass,
  valueItemUiStyle,
} = usePivotStore<T>()

const renderedColumns = computed(() => props.columns ?? visibleValueColumns.value)

// Cells are built for the rendered columns only, from the row's value arrays
const displayedCells = computed(() => {
  return resolvePivotDisplayedValueCells({
    row: props.row,
    columns: renderedColumns.value,
    layout: valueLayout.value,
  })
})

const valueItemClass = computed(() => {
  return [
    valueItemUiClass.value,
    {
      'is-subtotal': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
      'is-empty-row': props.item.kind === 'emptyRow',
    },
  ]
})

const valueItemStyle = computed(() => {
  // Only the full row sets the full width; a virtualized slice sizes to its cells
  const totalWidth = props.columns ? 0 : visibleValueColumnsWidthPx.value

  return {
    ...valueItemUiStyle.value,
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
      :column="renderedColumns[index]!"
      :row
    />
  </div>
</template>

<script setup lang="ts">
// Types
import type { IPivotValueHeaderCell } from './types/pivot-value-column-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  cell: IPivotValueHeaderCell
}

defineProps<IProps>()

const { ui } = usePivotStore()

const valueHeaderCellClass = computed(() => {
  return ui.value?.valueHeaderCellClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.valueHeaderCellClass(),
  })
})

const valueHeaderCellStyle = computed(() => {
  return ui.value?.valueHeaderCellStyle?.()
})
</script>

<template>
  <div
    class="pivot-value-header-cell"
    :class="valueHeaderCellClass"
    :style="valueHeaderCellStyle"
    :title="cell.label"
  >
    <span class="truncate">
      {{ cell.label }}
    </span>
  </div>
</template>

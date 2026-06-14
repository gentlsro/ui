<script setup lang="ts">
// Types
import type { IPivotValueHeaderCell } from './types/pivot-value-column-item.type'

// Functions
import { isPivotColumnHeaderHidden } from './functions/pivot-column-collapse'
import { isValueHeaderCellCollapsible } from './functions/is-value-header-cell-collapsible'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  cell: IPivotValueHeaderCell
}

const props = defineProps<IProps>()

const { columns, ui, state } = usePivotStore()

const isCollapsible = computed(() => {
  return isValueHeaderCellCollapsible({ columns: columns.value, cell: props.cell })
})

const isHidden = computed(() => {
  if (!props.cell.groupId) {
    return false
  }

  return isPivotColumnHeaderHidden(
    props.cell.groupId,
    state.value.collapsedColumnGroupIds,
  )
})

const valueHeaderCellClass = computed(() => {
  return [
    ui.value?.valueHeaderCellClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueHeaderCellClass(),
    }),
    {
      'is-collapsible': isCollapsible.value,
    },
  ]
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
    <PivotCollapseBtn
      v-if="isCollapsible && !isHidden && cell.groupId"
      :group-id="cell.groupId"
      axis="column"
    />

    <span
      v-if="!isHidden"
      class="truncate"
    >
      {{ cell.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const { columns, ui } = usePivotStore()

const columnFiltersClass = computed(() => {
  return ui.value?.columnFiltersClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.columnFiltersClass(),
  })
})

const columnFiltersStyle = computed(() => {
  return ui.value?.columnFiltersStyle?.()
})
</script>

<template>
  <div
    class="pivot-column-filters"
    :class="columnFiltersClass"
    :style="columnFiltersStyle"
  >
    <PivotFilterBtn
      v-for="column in columns"
      :key="column.field"
      :item="column"
      show-label
    />
  </div>
</template>

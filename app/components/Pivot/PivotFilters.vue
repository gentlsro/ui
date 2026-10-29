<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const { filters, ui } = usePivotStore()

const customFilters = computed(() => {
  return filters.value.filter(filter => !filter.usage.row && !filter.usage.column)
})

const filtersClass = computed(() => {
  return ui.value?.filtersClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.filtersClass(),
  })
})

const filtersStyle = computed(() => {
  return ui.value?.filtersStyle?.()
})
</script>

<template>
  <div
    class="pivot-filters"
    :class="filtersClass"
    :style="filtersStyle"
  >
    <PivotFilterBtn
      v-for="filter in customFilters"
      :key="filter.field"
      :item="filter"
      show-label
    />
  </div>
</template>

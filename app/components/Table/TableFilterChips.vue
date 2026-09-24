<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const { nonHelperColumns } = useTableStore()

const columnFilters = computed(() => {
  return nonHelperColumns.value
    .flatMap(col => col.filterDbQuery)
    .filter(filter => !filter.nonInteractive)
})
</script>

<template>
  <HorizontalScroller
    v-if="columnFilters.length"
    class="table-filter-chips"
    :ui="{ contentClass: ({ defaults }) => `${defaults.all} gap-1.5 items-center` }"
  >
    <TableFilterChip
      v-for="filter in columnFilters"
      :key="filter.id"
      :filter
    />
  </HorizontalScroller>
</template>

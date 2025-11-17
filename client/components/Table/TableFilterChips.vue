<script setup lang="ts">
// Store
import { useTableStore } from './stores/table2.store'

// Store
const { nonHelperColumns } = useTableStore()

const columnFilters = computed(() => {
  return nonHelperColumns.value
    .flatMap(col => col.filterDbQuery)
    .filter(filter => !filter.nonInteractive)
})
</script>

<template>
  <HorizontalScroller>
    <TableFilterChip
      v-for="filter in columnFilters"
      :key="filter.id"
      :filter
    />

    <!-- No filters -->
    <p
      v-if="!columnFilters.length"
      text="caption xs"
      leading="37px"
    >
      {{ $t('table.noFilters') }}
    </p>
  </HorizontalScroller>
</template>

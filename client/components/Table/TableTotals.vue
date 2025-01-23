<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const { totalsEl, totalsX, visibleColumns } = storeToRefs(useTableStore())
</script>

<template>
  <HorizontalScroller
    ref="totalsEl"
    v-model:scroll-position="totalsX"
    class="table-totals"
    :ui="{ contentClass: 'gap-0' }"
  >
    <TableTotalsCell
      v-for="col in visibleColumns"
      :key="col.field"
      :column="col"
    />
  </HorizontalScroller>
</template>

<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const { paginationConfig } = storeToRefs(useTableStore())
</script>

<template>
  <div class="table-bottom">
    <!-- Left -->
    <TableTotalRows />

    <!-- Center -->
    <TablePagination v-if="paginationConfig?.enabled" />
    <span v-else />

    <!-- Right -->
    <div
      v-if="paginationConfig?.enabled"
      flex="~ items-center"
      m="l-auto"
    >
      <span
        text="caption"
        class="!lt-md:hidden"
      >
        {{ $t('table.rowsPerPage') }}
      </span>

      <Selector
        v-model="paginationConfig.pageSize"
        :options="paginationConfig.options"
        no-search
        no-sort
        size="sm"
        emit-key
        layout="inline"
        m="l-auto"
        :no-menu-match-width="true"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-bottom {
  @apply grid p-x-2 items-center;

  grid-template-columns: 1fr auto 1fr;
}
</style>

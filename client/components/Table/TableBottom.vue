<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const {
  isDataLoading,
  isMetaLoading,
  paginationConfig,
} = storeToRefs(useTableStore())
</script>

<template>
  <div class="table-bottom">
    <!-- Left -->
    <TableTotalRows />

    <!-- Center -->
    <TablePagination v-if="paginationConfig?.enabled" />
    <!-- Loading -->
    <div
      v-else
      class="is-loading"
    >
      <LoaderInline
        v-if="isDataLoading || isMetaLoading"
        size="sm"
        roudned-full
      />
    </div>

    <!-- Right -->
    <div
      v-if="paginationConfig?.enabled"
      flex="~ items-center"
      m="l-auto"
    >
      <span
        text="caption"
        class="hidden @lg:block"
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
  @apply relative grid p-x-2 items-center min-h-10;

  grid-template-columns: 1fr auto 1fr;

  .is-loading {
    @apply absolute left-1/2 -translate-x-1/2 top-0;
  }
}
</style>

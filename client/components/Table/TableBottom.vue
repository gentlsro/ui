<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const {
  isDataLoading,
  isMetaLoading,
  paginationConfig,
  rowsLimit,
  rows,
} = storeToRefs(useTableStore())

const isLimitReached = computed(() => {
  if (!rowsLimit.value) {
    return false
  }

  return rows.value.length >= rowsLimit.value
})
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

    <!-- Limit reached -->
    <div
      v-if="isLimitReached"
      class="limit-reached"
    >
      <div class="color-warning i-bi:info-lg" />
      <span>{{ $t('table.limitRowsReached') }}</span>

      <Tooltip
        placement="top"
        w="120"
        :offset="8"
        text="center"
      >
        {{ $t('table.limitRowsReachedTooltip') }}
      </Tooltip>
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

  .limit-reached {
    @apply absolute flex flex-center gap-2 bg-white dark:bg-dark-950 rounded-custom;
    @apply left-1/2 -translate-x-1/2 p-l-1 p-r-3;
  }
}
</style>

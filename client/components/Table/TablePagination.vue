<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Types
import type { ITableProps } from './types/table-props.type'

// Store
const {
  isDataLoading,
  isMetaLoading,
  totalPages,
  currentPage,
  paginationConfig,
} = storeToRefs(useTableStore())

const isFirstPage = computed(() => currentPage.value === 1)
const isLastPage = computed(() => currentPage.value === totalPages.value)

const pages = computed(() => {
  // Less than 5 pages
  if (totalPages.value <= 5) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }

  // We are currently on the first or second page
  // -> [1, 2, 3, ..., pageCount]
  else if (isFirstPage.value) {
    return [1, 2, 3, Number.POSITIVE_INFINITY, totalPages.value]
  }

  // We are currently on the last or second to last page
  // -> [1, ..., pageCount - 2, pageCount - 1, pageCount]
  else if (isLastPage.value || currentPage.value === totalPages.value - 1) {
    return [
      1,
      Number.POSITIVE_INFINITY,
      totalPages.value - 2,
      totalPages.value - 1,
      totalPages.value,
    ]
  }

  // We are currently on some page in between
  // -> [currentPage - 1, currentPage, currentPage + 1, ..., pageCount]
  else {
    return [
      currentPage.value - 1,
      currentPage.value,
      currentPage.value + 1,
      Number.POSITIVE_INFINITY,
      totalPages.value,
    ]
  }
})
</script>

<template>
  <div
    class="table-pagination"
    :class="{ 'has-pagination': paginationConfig?.enabled }"
  >
    <!-- First page -->
    <Btn
      :disabled="isFirstPage"
      size="sm"
      disable-style="flat"
      class="pagination-el"
      icon="i-line-md:chevron-small-double-right rotate-180"
      @click="currentPage = 1"
    />

    <!-- Previous page -->
    <Btn
      :disabled="isFirstPage"
      size="sm"
      disable-style="flat"
      class="pagination-el"
      icon="i-material-symbols:chevron-right-rounded rotate-180"
      @click="currentPage--"
    />

    <!-- Pages -->
    <template
      v-for="(page, idx) in pages"
      :key="idx"
    >
      <Btn
        v-if="page !== Infinity"
        size="sm"
        :label="page"
        class="pagination-el"
        :class="{ 'is-active': page === currentPage }"
        @click="currentPage = page"
      />
      <div
        v-else
        class="font-rem-12 m-t-1 pagination-el"
      >
        ...
      </div>
    </template>

    <!-- Next page -->
    <Btn
      :disabled="isLastPage"
      size="sm"
      icon="i-material-symbols:chevron-right-rounded"
      class="pagination-el"
      @click="currentPage++"
    />

    <!-- Last page -->
    <Btn
      :disabled="isLastPage"
      size="sm"
      disable-style="flat"
      class="pagination-el"
      icon="i-line-md:chevron-small-double-right"
      @click="currentPage = totalPages"
    />

    <!-- Loading -->
    <div
      v-if="isDataLoading || isMetaLoading"
      class="is-loading"
    >
      <LoaderInline
        size="sm"
        roudned-full
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-pagination {
  @apply relative flex gap-2px items-center p-y-1;

  &:not(.has-pagination) > .pagination-el {
    @apply invisible;
  }

  .is-active {
    @apply bg-primary color-white;
  }

  .is-loading {
    @apply flex flex-center absolute inset-0 rounded-full backdrop-blur-2;
  }
}
</style>

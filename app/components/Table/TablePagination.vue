<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Store
const {
  totalPages,
  currentPage,
  paginationConfig,
} = useTableStore()

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
      size="xm"
      disable-style="flat"
      class="pagination-el"
      icon="i-lucide:chevrons-left"
      @click="currentPage = 1"
    />

    <!-- Previous page -->
    <Btn
      :disabled="isFirstPage"
      size="xm"
      disable-style="flat"
      class="pagination-el"
      icon="i-lucide:chevron-left"
      @click="currentPage--"
    />

    <!-- Pages -->
    <template
      v-for="(page, idx) in pages"
      :key="idx"
    >
      <Btn
        v-if="page !== Infinity"
        size="xm"
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
      size="xm"
      icon="i-lucide:chevron-right"
      class="pagination-el"
      @click="currentPage++"
    />

    <!-- Last page -->
    <Btn
      :disabled="isLastPage"
      size="xm"
      disable-style="flat"
      class="pagination-el"
      icon="i-lucide:chevrons-right"
      @click="currentPage = totalPages"
    />
  </div>
</template>

<style scoped lang="scss">
.table-pagination {
  @apply relative flex gap-2px items-center p-y-1;

  &:not(.has-pagination) > .pagination-el {
    @apply invisible;
  }

  .pagination-el {
    @apply rounded-md color-true-gray-600 dark:color-true-gray-300 font-medium;
  }

  .is-active {
    @apply bg-primary color-white;
  }
}
</style>

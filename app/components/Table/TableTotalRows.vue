<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Functions
import { tableGetPageRange } from './functions/table-get-page-range'

// Utils
const { formatNumber } = useNumber()

// Store
const {
  paginationConfig,
  currentPage,
  rows,
  totalRows,
} = useTableStore()

const pageSize = computed(() => paginationConfig.value?.pageSize ?? 1)

const pageRange = computed(() => {
  return tableGetPageRange({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    rowsCount: rows.value.length,
  })
})
</script>

<template>
  <div
    v-if="paginationConfig?.enabled"
    class="total-rows"
  >
    <span font="semibold">
      {{ pageRange.from }} -
      {{ pageRange.to }}
    </span>

    {{ $t('general.outOf') }}

    <span font="semibold">{{ formatNumber(totalRows) }}</span>

    {{ $t('general.row', totalRows || 0) }}
  </div>

  <div
    v-else
    class="total-rows"
  >
    <span
      font="semibold"
      data-cy="current-rows"
    >
      {{ rows.length }}
    </span>

    {{ $t('general.outOf') }}

    <span
      font="semibold"
      data-cy="total-rows"
    >
      {{ formatNumber(totalRows) }}
    </span>

    {{ $t('general.row', totalRows || 0) }}
  </div>
</template>

<style scoped lang="scss">
.total-rows {
  @apply text-caption font-rem-13 lowercase;
}
</style>

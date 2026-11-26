<script setup lang="ts">
// Store
import { useTableStore } from './stores/table.store'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

// Placeholder rows shown on the first load, one bar per visible column, so the
// table keeps its shape (header, columns, row height) until the data arrives
const { visibleColumns, paginationConfig, getColumnWidth } = useTableStore()

const rowsCount = computed(() => Math.min(paginationConfig.value?.pageSize || 10, 12))

// Varied bar widths read as content rather than a striped pattern
const BAR_WIDTHS = [72, 54, 86, 63, 78, 58, 90, 67, 81, 49]

const rowClass = TABLE_DEFAULT_PROPS.ui.rowClass().base
const cellDefaults = TABLE_DEFAULT_PROPS.ui.cellClass()
const cellClass = [cellDefaults.base, cellDefaults.rowSeparatorVertical, cellDefaults.rowSeparatorHorizontal, cellDefaults.rowSeparatorCell]
</script>

<template>
  <div
    class="table-skeleton grow min-h-0 overflow-hidden"
    data-cy="table-skeleton"
  >
    <div
      v-for="rowIdx in rowsCount"
      :key="rowIdx"
      class="tr is-row table-skeleton__row"
      :class="rowClass"
    >
      <div
        v-for="(column, colIdx) in visibleColumns"
        :key="column.field"
        class="td"
        :class="cellClass"
        :style="{ '--colWidth': getColumnWidth(column) }"
      >
        <Skeleton
          v-if="!column.isHelperCol"
          class="table-skeleton__bar"
          :style="{ width: `${BAR_WIDTHS[(rowIdx + colIdx * 3) % BAR_WIDTHS.length]}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-skeleton__row {
  @apply h-9 shrink-0;

  // Rows are not interactive while loading
  &:hover {
    @apply bg-inherit;
  }
}

.table-skeleton__bar {
  @apply h-3 rounded-full max-w-60;
}

.table-skeleton__row > .td {
  flex-shrink: 0;
}
</style>

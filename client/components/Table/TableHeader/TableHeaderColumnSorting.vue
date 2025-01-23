<script setup lang="ts">
// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = storeToRefs(useTableStore())

// Layout
const column = toRef(props, 'column')

function handleSort(sort?: 'asc' | 'desc', ev?: PointerEvent) {
  const isShift = ev?.shiftKey
  column.value.sort = sort

  if (isShift) {
    if (!sort) {
    // These are the columns that have higher sortOrder than the current column
    // We need to adjust their number accordingly, so that the order is not broken
      const sortedColumnsAfter = internalColumns.value.filter(col => {
        return col.sortOrder !== undefined && col.sortOrder > column.value.sortOrder!
      })

      sortedColumnsAfter.forEach(col => {
        col.sortOrder! -= 1
      })

      column.value.sortOrder = undefined
    } else if (!column.value.sortOrder) {
      column.value.sortOrder = internalColumns.value
        .filter(col => col.sortOrder !== undefined)
        .length + 1
    }
  } else {
    internalColumns.value.forEach(col => {
      if (col !== column.value || sort === undefined) {
        col.sort = undefined
        col.sortOrder = undefined
      } else {
        col.sortOrder = 1
      }
    })
  }
}
</script>

<template>
  <div class="sorting">
    <!-- Title -->
    <div class="sorting__title">
      <span class="sorting__title-label">
        {{ $t('general.sorting.self') }}
      </span>

      <Btn
        :label="$t('general.sorting.clear')"
        size="xs"
        color="negative"
        @click="handleSort(undefined, $event)"
      />
    </div>

    <!-- Content -->
    <div class="sorting__content">
      <!-- Ascending -->
      <Btn
        :label="$t('general.sorting.asc')"
        size="sm"
        no-uppercase
        color="ca"
        icon="i-ph:sort-descending-bold"
        class="!rounded-r-0"
        border="r-1 ca"
        :class="{ 'is-active': column.sort === 'asc' }"
        data-cy="sort-asc"
        @click="handleSort('asc', $event)"
      />

      <!-- Descending -->
      <Btn
        :label="$t('general.sorting.desc')"
        size="sm"
        no-uppercase
        color="ca"
        class="!rounded-l-0"
        icon="i-ph:sort-ascending-bold"
        :class="{ 'is-active': column.sort === 'desc' }"
        data-cy="sort-desc"
        @click="handleSort('desc', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sorting {
  @apply flex flex-col gap-1 p-2;

  &__title {
    @apply flex items-center gap-2;

    &-label {
      @apply grow font-semibold font-rem-14;
    }
  }

  &__content {
    @apply grid grid-cols-2 border-1 border-ca rounded-custom;
  }

  .is-active {
    @apply bg-primary color-white;
  }
}
</style>

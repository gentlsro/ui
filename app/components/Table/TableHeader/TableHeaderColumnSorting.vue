<script setup lang="ts">
// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'

// Functions
import { tableSetColumnSort } from '../functions/table-set-column-sort'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = useTableStore()

// Layout
const column = toRef(props, 'column')

function handleSort(sort?: 'asc' | 'desc', ev?: PointerEvent) {
  // With shift, the column joins (or leaves) the multi-sort
  if (ev?.shiftKey) {
    tableSetColumnSort(internalColumns.value, column.value, sort)
  } else {
    column.value.sort = sort

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
        v-if="column.sort"
        :label="$t('general.sorting.clear')"
        size="xs"
        no-uppercase
        class="sorting__clear"
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
        icon="i-lucide:arrow-up-narrow-wide"
        class="sorting__option"
        :class="{ 'is-active': column.sort === 'asc' }"
        data-cy="sort-asc"
        @click="handleSort('asc', $event)"
      />

      <!-- Descending -->
      <Btn
        :label="$t('general.sorting.desc')"
        size="sm"
        no-uppercase
        class="sorting__option"
        icon="i-lucide:arrow-down-wide-narrow"
        :class="{ 'is-active': column.sort === 'desc' }"
        data-cy="sort-desc"
        @click="handleSort('desc', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sorting {
  @apply flex flex-col gap-2 p-3 p-b-2;

  &__title {
    @apply flex items-center gap-2 min-h-6;

    &-label {
      @apply grow text-xs font-medium color-true-gray-500 dark:color-true-gray-400;
    }
  }

  &__clear {
    @apply color-true-gray-500 dark:color-true-gray-400 rounded-md font-medium;

    &:hover {
      @apply color-negative bg-negative/8;
    }
  }

  // The two directions side by side, the active one tinted
  &__content {
    @apply grid grid-cols-2 gap-1;
  }

  &__option {
    @apply rounded-md color-true-gray-600 dark:color-true-gray-300 font-medium
    border-1 border-true-gray-200 dark:border-true-gray-800;

    &:hover {
      @apply bg-true-gray-100 dark:bg-true-gray-800;
    }

    &.is-active {
      @apply bg-primary/10 color-primary dark:bg-primary/40 dark:color-white;
    }
  }
}
</style>

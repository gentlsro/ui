<script setup lang="ts">
import { klona } from 'klona/full'
// Types
import type { ITableFilterItem } from '../types/table-filter-item.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableFilterValueChangeDebounce } from '../functions/table-filter-value-change-debounce'
import { tableSetColumnSort } from '../functions/table-set-column-sort'

// Store
import { useTableStore } from '../stores/table.store'

const props = defineProps<IProps>()

// Constants
const NON_VALUE_COMPARATORS = getNonValueComparators()

type IProps = {
  column: TableColumn
}

// Store
const { modifiers, internalColumns } = useTableStore()
const { filterValueChangeDebounce = tableFilterValueChangeDebounce } = modifiers.value ?? {}

// Layout
const filteringEl = useTemplateRef('filteringEl')
const column = toRef(props, 'column')
const columnCopy = ref(klona(column.value))
const isMenuOpen = ref(false)
const { focused: isFocusedWithin } = useFocusWithin(filteringEl)

const isTooltipAccessible = computed(() => {
  const col = column.value

  return !isMenuOpen.value && (col.filterDbQuery.length || col.sort)
})

const btnClass = computed(() => {
  return {
    'is-filtered': !!column.value.filterDbQuery.length,
    'is-sorted': !!column.value.sort,
    'is-open': isMenuOpen.value,
  }
})

// The sort order only matters when more than one column is sorted
const isMultiSort = computed(() => {
  return internalColumns.value.filter(col => col.sort).length > 1
})

function handleClick(ev: PointerEvent) {
  const isShift = ev.shiftKey

  // When shift is not used, we simply open the menu
  if (!isShift) {
    $hide({ all: true, type: 'menu' })
    isMenuOpen.value = true

    return
  }

  // Otherwise (with shift) we quick-sort the column
  if (!column.value.sortable) {
    return
  }

  const currentSort = column.value.sort
  let newSort = column.value.sort

  if (currentSort === 'asc') {
    newSort = 'desc'
  } else if (currentSort === 'desc') {
    newSort = undefined
  } else {
    newSort = 'asc'
  }

  tableSetColumnSort(internalColumns.value, column.value, newSort)
}

function handleMenuBeforeShow() {
  columnCopy.value = klona(column.value)
}

function handleMenuBeforeHide() {
  column.value.filters = column.value.filters.filter(filter => {
    const isNonValueComparator = NON_VALUE_COMPARATORS
      .includes(filter.comparator)

    const isUndefinedValue = filter.value === undefined
    const isEmptyArray = Array.isArray(filter.value) && !filter.value.length

    return (
      (!isUndefinedValue && !isEmptyArray)
      || isNonValueComparator
      || filter.nonInteractive
    )
  })
}

// // Debouncing
let timeout: any

function modifyFnc(filter: ITableFilterItem, debounceMs?: number) {
  const _debounceMs = debounceMs ?? filterValueChangeDebounce({ column: column.value, filter })
  debouncedSync(_debounceMs)
}

function removeFnc() {
  debouncedSync(0)
}

function debouncedSync(ms: number) {
  clearTimeout(timeout)
  timeout = null

  timeout = setTimeout(() => {
    column.value.filters = columnCopy.value.filters.map(f => new FilterItem(f))
  }, ms)
}

onKeyStroke('Enter', ev => {
  const isCtrlKey = ev.ctrlKey || ev.metaKey

  if (isCtrlKey && isFocusedWithin.value) {
    ev.stopPropagation()
    ev.preventDefault()

    $hide({ all: true, type: 'menu' })
  }
})
</script>

<template>
  <Btn
    class="filter-btn"
    size="xs"
    no-dim
    :class="btnClass"
    @click="handleClick"
  >
    <!-- Icon -->
    <template #icon>
      <div class="filter-btn__icons">
        <!-- Sort direction -->
        <div
          v-if="column.sort"
          class="filter-btn__sort"
          data-cy="sort-outline"
        >
          <div
            class="icon"
            :class="column.sort === 'asc' ? 'i-lucide:arrow-up' : 'i-lucide:arrow-down'"
          />

          <span
            v-if="isMultiSort"
            class="filter-btn__sort-order"
          >
            {{ column.sortOrder }}
          </span>
        </div>

        <!-- Filter -->
        <div
          v-if="column.filterDbQuery.length"
          class="icon i-lucide:list-filter"
        />

        <!-- Idle -->
        <div
          v-if="!column.sort && !column.filterDbQuery.length"
          class="icon i-lucide:chevron-down"
        />
      </div>
    </template>

    <!-- Tooltip -->
    <TableHeaderFilterBtnTooltip
      v-if="isTooltipAccessible"
      :column
    />

    <!-- Menu -->
    <MenuProxy
      v-model="isMenuOpen"
      w="90"
      manual
      h="!auto"
      max-h="!2/3"
      :ui="{ contentClass: ({ defaults }) => `${defaults.all} gap-3` }"
      :no-arrow="false"
      no-transition
      dense
      @before-show="handleMenuBeforeShow"
      @before-hide="handleMenuBeforeHide"
    >
      <TableHeaderColumnSorting
        v-if="column.sortable"
        :column
      />

      <TableHeaderColumnFiltering
        v-if="column.filterable"
        ref="filteringEl"
        :column="columnCopy"
        :modify-fnc
        :remove-fnc
      />

      <Banner
        v-else-if="column.filterDbQuery?.length"
        :label="$t('table.filteredManually')"
        outlined
        variant="info"
        icon-center
        m="x-2 b-2"
      />
    </MenuProxy>
  </Btn>
</template>

<style scoped lang="scss">
.filter-btn {
  @apply color-true-gray-500 dark:color-true-gray-400 rounded-md p-x-1 transition-opacity;

  &:hover,
  &.is-open {
    @apply bg-true-gray-200/70 dark:bg-white/10 color-true-gray-800 dark:color-true-gray-100;
  }

  &.is-sorted,
  &.is-filtered {
    @apply color-primary bg-primary/10 dark:color-true-gray-100 dark:bg-primary/45;
  }

  &__icons {
    @apply flex items-center gap-0.5;
  }

  &__sort {
    @apply flex items-center;

    &-order {
      @apply text-10px font-semibold leading-none tabular-nums;
    }
  }

  .icon {
    @apply w-3.5 h-3.5 shrink-0;
  }
}

// Idle columns only reveal the menu button on hover, like the freeze button
.th:not(:hover, :focus-within) .filter-btn:not(.is-sorted, .is-filtered, .is-open) {
  opacity: 0;
}
</style>

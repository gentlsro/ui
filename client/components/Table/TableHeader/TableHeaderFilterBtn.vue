<script setup lang="ts">
import { klona } from 'klona/full'
import { FilterItem, NON_VALUE_COMPARATORS } from '$utils'

// Types
import type { ITableFilterItem } from '../types/table-filter-item.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableFilterValueChangeDebounce } from '../functions/table-filter-value-change-debounce'

// Store
import { useTableStore } from '../stores/table.store'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const { modifiers, internalColumns } = storeToRefs(useTableStore())
const { filterValueChangeDebounce = tableFilterValueChangeDebounce } = modifiers.value ?? {}

// Layout
const column = toRef(props, 'column')
const columnCopy = ref(klona(column.value))
const isMenuOpen = ref(false)

const isTooltipAccessible = computed(() => {
  const col = column.value

  return !isMenuOpen.value && (col.filterDbQuery.length || col.sort)
})

const btnClass = computed(() => {
  return {
    'is-filtered': !!column.value.filterDbQuery.length,
    'is-sorted': column.value.sort,
  }
})

function handleClick(ev: PointerEvent) {
  const isShift = ev.shiftKey

  // When shift is not used, we open the menu
  if (!isShift) {
    isMenuOpen.value = true

    return
  }

  // Otherwise we quick-sort the column
  const currentSort = column.value.sort
  let newSort = column.value.sort

  if (currentSort === 'asc') {
    newSort = 'desc'
  } else if (currentSort === 'desc') {
    newSort = undefined
  } else {
    newSort = 'asc'
  }

  column.value.sort = newSort
  if (!newSort) {
    // These are the columns that have higher sortOrder than the current column
    // We need to adjust their number accordingly, so that the order is not broken
    const sortedColumnsAfter = internalColumns.value.filter(col => {
      return col.sortOrder !== undefined && col.sortOrder > column.value.sortOrder!
    })

    sortedColumnsAfter.forEach(col => col.sortOrder! -= 1)
    column.value.sortOrder = undefined
  } else if (!column.value.sortOrder) {
    column.value.sortOrder = internalColumns.value
      .filter(col => col.sortOrder !== undefined)
      .length + 1
  }
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

function modifyFnc(filter: ITableFilterItem) {
  const debounceMs = filterValueChangeDebounce({ column: column.value, filter })
  console.log('Log ~ modifyFnc ~ debounceMs:', debounceMs)
  debouncedSync(debounceMs)
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
</script>

<template>
  <Btn
    class="filter-btn"
    size="sm"
    :class="btnClass"
    @click="handleClick"
  >
    <!-- Icon -->
    <template #icon>
      <div class="w-7 h-7 relative">
        <div
          class="icon top-.25 left-.25 i-ic:round-filter-alt"
          :class="{ 'color-white': column.filterDbQuery.length }"
        />
        <div
          class="icon bottom-.25 right-.25 i-basil:sort-outline"
          :class="{ 'color-white': column.sort }"
          z-1
          data-cy="sort-outline"
        />

        <div
          v-if="column.sortOrder"
          class="icon-badge"
        >
          {{ column.sortOrder }}
        </div>
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
      :ui="{ contentClass: '!gap-2' }"
      :no-arrow="false"
      @before-show="handleMenuBeforeShow"
      @before-hide="handleMenuBeforeHide"
    >
      <TableHeaderColumnSorting
        v-if="column.sortable"
        :column
      />

      <TableHeaderColumnFiltering
        v-if="column.filterable"
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
.icon {
  @apply w-4 h-4 absolute;

  &-badge {
    @apply flex flex-center absolute -bottom-.5 -right-.5 w-3 h-3 bg-white
      color-black text-9px rounded-full leading-none z-1;
  }
}

.filter-btn {
  @apply overflow-hidden;

  &.is-filtered::before {
    @apply absolute content-empty rotate-45 bg-primary -top-24.5px -left-24.5px
      w-1 h-3/2 w-3/2;
  }

  &.is-sorted::after {
    @apply absolute content-empty rotate-45 bg-secondary -bottom-24.5px -right-24.5px
      w-1 h-3/2 w-3/2;
  }
}
</style>

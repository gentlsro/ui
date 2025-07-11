<script setup lang="ts">
import type { VNode } from 'vue'
import { useTableStore } from '$ui'
import { ComparatorEnum } from '$comparatorEnum'
import { BOOLEANISH_COMPARATORS, FilterItem } from '$utils'

// Types
import type { ITableFilterItem } from '../../types/table-filter-item.type'

// Models
import type { TableColumn } from '../../models/table-column.model'

// Functions
import { getAvailableComparators } from '../../functions/get-available-comparators'

type IProps = {
  column: TableColumn
  modifyFnc?: (filter: ITableFilterItem, debounceMs?: number) => void
  removeFnc?: (filter: ITableFilterItem) => void
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = storeToRefs(useTableStore())

// Layout
const isMounted = ref(false)
const filteringItemEl = useTemplateRef('filteringItemEl')
const column = toRef(props, 'column')

const interactiveFilters = computed(() => {
  return column.value.filters.filter(filter => !filter.nonInteractive)
})

const hasUnusedComparator = computed(() => {
  const availableComparators = getAvailableComparators(column.value.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
    extraComparators: column.value.extraComparators,
    allowedComparators: column.value.comparators,
  })

  const columnComparators = column.value.filters.flatMap(filter => {
    const isBooleanishComparator = BOOLEANISH_COMPARATORS
      .includes(filter.comparator)

    return isBooleanishComparator ? BOOLEANISH_COMPARATORS : [filter.comparator]
  })

  return availableComparators.some(comparator => {
    return !columnComparators.includes(comparator)
  })
})

function handleAddFilter() {
  const comparators = getAvailableComparators(column.value.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
    extraComparators: column.value.extraComparators,
    allowedComparators: column.value.comparators,
  })

  const isDefaultComparatorUsed = column.value.filters.some(filter => {
    return filter.comparator === ComparatorEnum.EQUAL
  })

  const firstUnusedComparator = comparators.find(comparator => {
    return !column.value.filters.some(filter => {
      return filter.comparator === comparator
    })
  })

  const comparator = isDefaultComparatorUsed
    ? firstUnusedComparator as ComparatorEnum
    : column.value.comparator

  column.value.filters = [
    ...column.value.filters,
    new FilterItem({ ...column.value, comparator }),
  ]
}

function handleRemoveFilter(idx: number) {
  props.removeFnc?.(column.value.filters[idx] as ITableFilterItem)
  column.value.filters = column.value.filters.toSpliced(idx, 1)
}

function handleClearFilter() {
  column.value.clearFilters()
  const col = internalColumns.value.find(col => col.field === column.value.field)

  col?.clearFilters()
}

function handleMountedFilteringItem(node: VNode) {
  if (isMounted.value) {
    node.component?.exposed?.focus?.()
  }
}

watchOnce(isMounted, () => {
  // We automatically add the first filter when the column has no filters
  if (!column.value.filters.length) {
    handleAddFilter()
  }

  // Or, in case we only have 1 filter, we focus it
  else if (column.value.filters.length === 1) {
    const el = filteringItemEl.value?.[0]
    el?.focus()
  }
})
</script>

<template>
  <div
    class="filtering"
    @vue:mounted="isMounted = true"
  >
    <!-- Title -->
    <div class="filtering__title">
      <span class="filtering__title-label">
        {{ $t('general.filter', 2) }}
      </span>

      <!-- Clear filter -->
      <Btn
        :label="$t('general.clearFilter')"
        color="negative"
        size="xs"
        @click="handleClearFilter"
      />
    </div>

    <!-- Content -->
    <div class="filtering__content">
      <TableHeaderColumnFilteringItem
        v-for="(item, idx) in interactiveFilters"
        ref="filteringItemEl"
        :key="item.id"
        :item
        :column
        :modify-fnc
        @vue:mounted="handleMountedFilteringItem"
        @remove:item="handleRemoveFilter(idx)"
      />
    </div>

    <!-- Add condition -->
    <Btn
      v-if="hasUnusedComparator"
      size="sm"
      no-uppercase
      outlined
      preset="ADD"
      :label="$t('table.addFilter')"
      bg="!white !dark:black"
      @click="handleAddFilter"
    />
  </div>
</template>

<style scoped lang="scss">
.filtering {
  @apply flex flex-col gap-1 p-2;

  &__title {
    @apply flex items-center gap-2;

    &-label {
      @apply grow font-semibold font-rem-14;
    }
  }

  &__content {
    @apply flex flex-col gap-2;
  }

  .is-active {
    @apply bg-primary color-white;
  }
}
</style>

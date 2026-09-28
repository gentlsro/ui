<script setup lang="ts" vapor>
import { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ITableFilterItem } from '../../types/table-filter-item.type'

// Models
import type { TableColumn } from '../../models/table-column.model'

// Functions
import { getAvailableComparators } from '../../functions/get-available-comparators'

// Store
import { useTableStore } from '../../stores/table.store'

type IProps = {
  column: TableColumn
  modifyFnc?: (filter: ITableFilterItem, debounceMs?: number) => void
  removeFnc?: (filter: ITableFilterItem) => void
}

const props = defineProps<IProps>()

// Constants
const BOOLEANISH_COMPARATORS = getBooleanishComparators()

// Store
const { internalColumns } = useTableStore()

// Layout
const isMounted = ref(false)
const filteringItems = new Map<string, { focus?: () => void }>()
function setFilteringItem(id: string, target: unknown) {
  if (target && typeof target === 'object' && 'focus' in target) {
    filteringItems.set(id, target as { focus?: () => void })
  } else {
    filteringItems.delete(id)
  }
}

onBeforeUnmount(() => {
  isMounted.value = false
  filteringItems.clear()
})
const column = toRef(props, 'column')

const interactiveFilters = computed(() => {
  return column.value.filters.filter(filter => !filter.nonInteractive)
})

// Keyed refs avoid relying on ref-array order after adding/removing filters.
watch(() => interactiveFilters.value.map(filter => filter.id), async (ids, previousIds) => {
  if (!isMounted.value) {
    return
  }

  const added = ids.find(id => !previousIds.includes(id))
  await nextTick()

  if (added && isMounted.value) {
    filteringItems.get(added)?.focus?.()
  }
}, { flush: 'post' })

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

function handleRemoveFilter(filter: FilterItem) {
  props.removeFnc?.(filter as ITableFilterItem)
  column.value.filters = column.value.filters.filter(f => f.id !== filter.id)
}

function handleClearFilter() {
  column.value.clearFilters()
  const col = internalColumns.value.find(col => col.field === column.value.field)

  col?.clearFilters()
}

onMounted(() => {
  isMounted.value = true
  // We automatically add the first filter when the column has no filters
  if (!interactiveFilters.value.length) {
    handleAddFilter()
  } else if (interactiveFilters.value.length === 1) {
    filteringItems.get(interactiveFilters.value[0]!.id)?.focus?.()
  }
})
</script>

<template>
  <div
    class="filtering"
  >
    <!-- Title -->
    <div class="filtering__title">
      <span class="filtering__title-label">
        {{ $t('general.filter', 2) }}
      </span>

      <!-- Clear filter -->
      <Btn
        v-if="interactiveFilters.length"
        :label="$t('general.clearFilter')"
        size="xs"
        no-uppercase
        class="filtering__clear"
        @click="handleClearFilter"
      />
    </div>

    <!-- Content -->
    <div class="filtering__content">
      <TableHeaderColumnFilteringItem
        v-for="item in interactiveFilters"
        :ref="target => setFilteringItem(item.id, target)"
        :key="item.id"
        :item
        :column
        :modify-fnc
        @remove:item="handleRemoveFilter(item)"
      />
    </div>

    <!-- Add condition -->
    <Btn
      v-if="hasUnusedComparator"
      size="sm"
      no-uppercase
      no-dim
      icon="i-lucide:plus"
      class="filtering__add"
      :label="$t('table.addFilter')"
      @click="handleAddFilter"
    />
  </div>
</template>

<style scoped lang="scss">
.filtering {
  @apply flex flex-col gap-2 p-3 p-t-2;

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

  &__content {
    @apply flex flex-col gap-3;

    &:empty {
      @apply hidden;
    }
  }

  &__add {
    @apply rounded-lg border-1 border-dashed border-true-gray-300 dark:border-true-gray-600
      color-true-gray-600 dark:color-true-gray-300 font-medium;

    &:hover {
      @apply border-primary/60 color-primary bg-primary/5 dark:color-white;
    }
  }
}
</style>

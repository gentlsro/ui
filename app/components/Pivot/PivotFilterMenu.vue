<script setup lang="ts" generic="T extends IItem = IItem">
import type { VNode } from 'vue'
import { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ITableFilterItem } from '../Table/types/table-filter-item.type'

// Models
import type { PivotItem } from './models/pivot-item.model'

// Functions
import { getAvailableComparators } from '../Table/functions/get-available-comparators'
import {
  getNextPivotFilterComparator,
  hasPivotItemActiveFilters,
  pivotItemToTableColumn,
} from './functions/pivot-filter-usage'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: PivotItem<T>
}

const props = defineProps<IProps>()

const { syncPivotItemFilters } = usePivotStore<T>()

const isMounted = ref(false)
const filteringItemEl = useTemplateRef('filteringItemEl')
const item = toRef(props, 'item')
const columnCopy = shallowRef(pivotItemToTableColumn(item.value))

const interactiveFilters = computed(() => {
  return columnCopy.value.filters.filter(filter => !filter.nonInteractive)
})

const hasUnusedComparator = computed(() => {
  const availableComparators = getAvailableComparators(columnCopy.value.dataType, {
    includeSelectorComparators: !!columnCopy.value.getDistinctData,
    extraComparators: columnCopy.value.extraComparators,
    allowedComparators: columnCopy.value.comparators,
  })

  const columnComparators = columnCopy.value.filters.flatMap(filter => {
    const isBooleanishComparator = getBooleanishComparators().includes(filter.comparator)

    return isBooleanishComparator ? getBooleanishComparators() : [filter.comparator]
  })

  return availableComparators.some(comparator => {
    return !columnComparators.includes(comparator)
  })
})

const isFiltered = computed(() => hasPivotItemActiveFilters(item.value))

function refreshColumnCopy() {
  columnCopy.value = pivotItemToTableColumn(item.value)
}

function replaceColumnCopyFilters(filters: FilterItem<T>[]) {
  const column = columnCopy.value

  columnCopy.value = new TableColumn<T>({
    field: column.field as TableColumn<T>['field'],
    dataType: column.dataType,
    label: column.label,
    comparator: column.comparator,
    filters,
    comparators: column.comparators,
    extraComparators: column.extraComparators,
    format: column.format,
    getDistinctData: column.getDistinctData,
    filterComponent: column.filterComponent,
  })
}

function handleAddFilter() {
  const comparators = getAvailableComparators(columnCopy.value.dataType, {
    includeSelectorComparators: !!columnCopy.value.getDistinctData,
    extraComparators: columnCopy.value.extraComparators,
    allowedComparators: columnCopy.value.comparators,
  })

  const comparator = getNextPivotFilterComparator(columnCopy.value, comparators)

  replaceColumnCopyFilters([
    ...columnCopy.value.filters,
    new FilterItem<T>({
      field: columnCopy.value.field as ITableFilterItem<T>['field'],
      dataType: columnCopy.value.dataType,
      comparator: comparator ?? ComparatorEnum.EQUAL,
    }),
  ])
}

function handleRemoveFilter(filter: FilterItem<T>) {
  replaceColumnCopyFilters(columnCopy.value.filters.filter(f => f.id !== filter.id))
  syncFilters()
}

function handleClearFilter() {
  replaceColumnCopyFilters([])
  syncFilters()
}

function handleMountedFilteringItem(node: VNode) {
  if (isMounted.value) {
    node.component?.exposed?.focus?.()
  }
}

let timeout: ReturnType<typeof setTimeout> | undefined

function modifyFnc(_filter: ITableFilterItem<T>, debounceMs?: number) {
  debouncedSync(debounceMs ?? 300)
}

function debouncedSync(ms: number) {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    syncFilters()
  }, ms)
}

function syncFilters() {
  syncPivotItemFilters(item.value, columnCopy.value)
}

function pruneEmptyFilters() {
  replaceColumnCopyFilters(columnCopy.value.filters.filter(filter => {
    const isNonValueComparator = getNonValueComparators().includes(filter.comparator)
    const isUndefinedValue = filter.value === undefined
    const isEmptyArray = Array.isArray(filter.value) && !filter.value.length

    return (
      (!isUndefinedValue && !isEmptyArray)
      || isNonValueComparator
      || filter.nonInteractive
    )
  }))

  syncFilters()
}

watch(item, () => {
  refreshColumnCopy()
}, { deep: true })

watchOnce(isMounted, () => {
  if (!columnCopy.value.filters.length) {
    handleAddFilter()
  } else if (columnCopy.value.filters.length === 1) {
    filteringItemEl.value?.[0]?.focus?.()
  }
})

defineExpose({
  isFiltered,
  refreshColumnCopy,
  pruneEmptyFilters,
})
</script>

<template>
  <div
    class="pivot-filter-menu"
    @vue:mounted="isMounted = true"
  >
    <div class="pivot-filter-menu__title">
      <span class="pivot-filter-menu__title-label">
        {{ $t('general.filter', 2) }}
      </span>

      <Btn
        :label="$t('general.clearFilter')"
        color="negative"
        size="xs"
        @click="handleClearFilter"
      />
    </div>

    <div class="pivot-filter-menu__content">
      <template
        v-for="(filterItem, index) in interactiveFilters"
        :key="index"
      >
        <PivotFilterMenuItem
          ref="filteringItemEl"
          :item="filterItem"
          :column="columnCopy"
          :modify-fnc="modifyFnc"
          @vue:mounted="handleMountedFilteringItem"
          @remove:item="handleRemoveFilter(filterItem)"
        />

        <Separator v-if="index !== interactiveFilters.length - 1" />
      </template>
    </div>

    <!-- Add filter -->
    <Btn
      v-if="hasUnusedComparator"
      size="sm"
      no-uppercase
      outlined
      preset="ADD"
      m="2"
      :label="$t('table.addFilter')"
      bg="!white !dark:black"
      @click="handleAddFilter"
    />
  </div>
</template>

<style scoped lang="scss">
.pivot-filter-menu {
  @apply flex flex-col gap-1;

  &__title {
    @apply flex items-center gap-2 p-x-2 p-y-1;

    &-label {
      @apply grow font-semibold font-rem-14;
    }
  }

  &__content {
    @apply flex flex-col gap-2 p-x-1;
  }
}
</style>

<script setup lang="ts">
// Types
import type { TableFeature } from './types/table-feature.type'

// Functions
import { queryBuilderInitializeItems } from '../QueryBuilder/functions/query-builder-initialize-items'

// Store
import { useTableStore } from './stores/table.store'

type IProps = {
  featuresEnabledByName: Record<TableFeature, boolean>
}

defineProps<IProps>()

// Store
const uiStore = useUIStore()
const { queryBuilder, internalColumns, state } = useTableStore()

function handleClearFilters(filterType: 'queryBuilder' | 'columns' | 'all' = 'all') {
  if (filterType === 'queryBuilder') {
    queryBuilder.value = queryBuilderInitializeItems()
    state.value.queryBuilder = queryBuilder.value
  } else if (filterType === 'columns') {
    internalColumns.value.forEach(col => col.clearFilters())

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  } else if (filterType === 'all') {
    queryBuilder.value = queryBuilderInitializeItems()
    state.value.queryBuilder = queryBuilder.value
    internalColumns.value.forEach(col => col.clearFilters())

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  }

  $hide()
}

const hasAnyFilters = computed(() => {
  return queryBuilder.value.length > 1 || internalColumns.value.some(col => col.filters.length > 0)
})

// Keyboard shortcuts
onKeyStroke(['d', 'D'], (ev: KeyboardEvent) => {
  const isCtrlKey = ev.ctrlKey || ev.metaKey
  const isFocusedInInput = uiStore.isActiveElementInput()

  if (isFocusedInInput || !isCtrlKey) {
    return
  }

  ev.preventDefault()
  handleClearFilters('all')
})
</script>

<template>
  <Btn
    size="xs"
    :label="$t('table.removeQueryBuilderFilters')"
    no-uppercase
    no-truncate
    stacked
    class="remove-filters"
    :class="hasAnyFilters ? 'color-negative' : 'color-ca'"
    data-cy="remove-filters"
  >
    <Menu
      placement="left"
      :no-arrow="false"
    >
      <!-- Remove query builder filters -->
      <Btn
        v-if="featuresEnabledByName.queryBuilder || featuresEnabledByName.queryBuilderDialog"
        :label="$t('table.removeQueryBuilderFilter')"
        size="sm"
        no-uppercase
        data-cy="remove-advanced-filter"
        @click="handleClearFilters('queryBuilder')"
      />

      <!-- Remove columns filters -->
      <Btn
        :label="$t('table.removeColumnsFilter')"
        size="sm"
        no-uppercase
        data-cy="remove-columns-filter"
        @click="handleClearFilters('columns')"
      />

      <Separator />

      <!-- Remove all filters -->
      <Btn
        :label="$t('table.removeAllFilters')"
        size="sm"
        no-uppercase
        color="negative"
        data-cy="remove-all-filters"
        @click="handleClearFilters('all')"
      >
        <KeyboardShortcut
          char="D"
          with-ctrl
          class="!absolute top--1 right-1"
        />
      </Btn>
    </Menu>
  </Btn>
</template>

<style scoped lang="scss">
.remove-filters {
  @apply shrink-0 w-20 min-h-9 dark:bg-black bg-white border-2
    border-transparent m-t-1;

  padding-block: 0 !important;

  &:hover,
  &.is-menu-active {
    @apply border-negative color-negative;
  }
}
</style>

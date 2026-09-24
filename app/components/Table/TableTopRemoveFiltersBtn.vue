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
    v-if="hasAnyFilters"
    size="sm"
    :label="$t('table.removeQueryBuilderFilters')"
    icon="i-lucide:x"
    no-uppercase
    no-dim
    class="remove-filters"
    p="!x-2"
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
  @apply shrink-0 rounded-lg color-true-gray-500 dark:color-true-gray-400 font-medium;

  &:hover,
  &.is-menu-active {
    @apply bg-negative/8 color-negative;
  }
}
</style>

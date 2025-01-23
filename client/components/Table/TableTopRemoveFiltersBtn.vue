<script setup lang="ts">
// Types
import type { TableFeature } from './types/table-feature.type'

// Functions
import { useTableStore } from './stores/table.store'
import { queryBuilderInitializeItems } from '../QueryBuilder/functions/query-builder-initialize-items'

type IProps = {
  featuresEnabledByName: Record<TableFeature, boolean>
}

defineProps<IProps>()

// Store
const uiStore = useUIStore()
const { queryBuilder, internalColumns } = storeToRefs(useTableStore())

function handleClearFilters(filterType: 'queryBuilder' | 'columns' | 'all' = 'all') {
  if (filterType === 'queryBuilder') {
    queryBuilder.value = queryBuilderInitializeItems()
  } else if (filterType === 'columns') {
    internalColumns.value.forEach(col => col.clearFilters())

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  } else if (filterType === 'all') {
    queryBuilder.value = queryBuilderInitializeItems()
    internalColumns.value.forEach(col => col.clearFilters())

    // Trigger the reactivity on columns
    internalColumns.value = [...internalColumns.value]
  }

  $hide()
}

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
    :ui="{ labelClass: '!m-t-0' }"
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
        p="!y-1.5"
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
  @apply shrink-0 w-20 min-h-10 dark:bg-darker bg-white color-ca border-2
    border-transparent;

  padding-block: 0 !important;

  &:hover,
  &.is-menu-active {
    @apply border-negative color-negative;
  }
}
</style>

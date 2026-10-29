<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { TableFeature } from './types/table-feature.type'
import type { IQueryBuilderRow } from '../QueryBuilder/types/query-builder-row-props.type'

// Constants
import { TABLE_LAYERED_CLASSES } from './constants/table-layered-classes.constant'

type IProps = Pick<ITableProps, 'queryBuilder' | 'queryBuilderProps' | 'search' | 'features' | 'ui'>
  & { forceVisibility?: boolean }

const props = defineProps<IProps>()

// Layout
const search = defineModel<string>('search', { default: '' })
const queryBuilder = defineModel<IQueryBuilderRow[]>('queryBuilder', { default: () => [] })

const featuresEnabledByName = computed<Record<TableFeature, boolean>>(() => {
  return props.features?.reduce((agg, feature) => {
    agg[feature] = true

    return agg
  }, {} as Record<TableFeature, boolean>) ?? {} as Record<TableFeature, boolean>
})

const isTableTopVisible = computed(() => {
  return props.forceVisibility
    || featuresEnabledByName.value.queryBuilderDialog
    || featuresEnabledByName.value.queryBuilder
    || featuresEnabledByName.value.filterChips
    || featuresEnabledByName.value.search
})

const topClass = computed(() => {
  return props.ui?.topClass?.({
    defaults: TABLE_LAYERED_CLASSES.topClass(),
  })
})

const topStyle = computed(() => {
  return props.ui?.topStyle?.()
})
</script>

<template>
  <div
    v-if="isTableTopVisible"
    class="table-top"
    :class="topClass"
    :style="topStyle"
  >
    <!-- Left -->
    <div class="table-top__left">
      <slot name="left">
        <!-- Query builder dialog -->
        <TableQueryBuilderBtn
          v-if="featuresEnabledByName.queryBuilderDialog"
          v-model:query-builder="queryBuilder"
          :query-builder-props
        />
      </slot>
    </div>

    <!-- Center -->
    <div class="table-top__center">
      <slot name="search">
        <TableSearch
          v-if="featuresEnabledByName.search"
          v-model:search="search"
        />
      </slot>

      <slot name="query-builder">
        <!-- A narrow table edits its conditions in the query builder dialog, when it has one -->
        <TableQueryBuilder
          v-if="featuresEnabledByName.queryBuilder"
          v-model:query-builder="queryBuilder"
          :query-builder-props
          :class="{ 'table-top__query-builder--dialog': featuresEnabledByName.queryBuilderDialog }"
        />
      </slot>

      <slot name="chips">
        <TableFilterChips v-if="featuresEnabledByName.filterChips" />
      </slot>
    </div>

    <!-- Right -->
    <!-- Remove filters -->
    <TableTopRemoveFiltersBtn
      class="table-top__remove-filters"
      :features-enabled-by-name
    />

    <!-- Export data -->
    <slot name="export">
      <TableExportBtn
        v-if="featuresEnabledByName.export"
        class="table-top__export"
      />
    </slot>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.table-top {
  &__left {
    @apply flex items-center shrink-0 order-10 min-h-9;
  }

  // Search and the inline conditions share one row, chips wrap below
  &__center {
    @apply grow min-w-0 flex flex-wrap items-start gap-x-2 gap-y-1 order-20 min-h-9;

    > :deep(*) {
      @apply min-w-0;
    }

    // Stays on the first line when the conditions wrap to more lines
    > :deep(.table-search) {
      @apply m-t-0.5;
    }

    > :deep(.scroller-vertical) {
      @apply grow basis-48;
    }

    > :deep(.table-filter-chips) {
      @apply basis-full;
    }
  }

  &__remove-filters {
    @apply order-30 m-t-0.5 shrink-0;
  }

  &__export {
    @apply order-40 m-t-0.5 shrink-0;
  }

  // The table is the container (`@container`), as for the toolbar's `@…:` classes
  @container (width < 32rem) {
    &__query-builder--dialog {
      display: none !important;
    }
  }
}
</style>

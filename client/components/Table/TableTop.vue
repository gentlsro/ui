<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { TableFeature } from './types/table-feature.type'
import type { IQueryBuilderRow } from '../QueryBuilder/types/query-builder-row-props.type'

type IProps = Pick<ITableProps, 'queryBuilder' | 'queryBuilderProps' | 'search' | 'features' | 'ui'>

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
  return featuresEnabledByName.value.queryBuilderDialog
    || featuresEnabledByName.value.queryBuilder
    || featuresEnabledByName.value.filterChips
    || featuresEnabledByName.value.search
})
</script>

<template>
  <div
    v-if="isTableTopVisible"
    class="table-top"
    :class="ui?.topClass"
    :style="ui?.topStyle"
  >
    <!-- Left -->
    <div class="table-top__left">
      <slot name="left">
        <!-- Query builder dialog -->
        <TableQueryBuilderBtn
          v-if="featuresEnabledByName.queryBuilderDialog"
          v-model:query-builder="queryBuilder"
          :query-builder-props
          m="r-2 t-1"
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
        <TableQueryBuilder
          v-if="featuresEnabledByName.queryBuilder"
          v-model:query-builder="queryBuilder"
          :query-builder-props
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
  @apply flex p-x-2 p-y-1 gap-1;

  &__left {
    @apply flex flex-col shrink-0 order-10;
  }

  &__center {
    @apply grow flex flex-col gap-1 self-center order-20;
  }

  &__remove-filters {
    @apply order-30;
  }

  &__export {
    @apply order-40;
  }
}
</style>

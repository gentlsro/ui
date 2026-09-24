<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { IQueryBuilderRow } from '../QueryBuilder/types/query-builder-row-props.type'
import type { IQueryBuilderItem } from '../QueryBuilder/types/query-builder-item-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'queryBuilder' | 'queryBuilderProps'>

defineProps<IProps>()

// Store
const {
  internalColumns,
  internalColumnsByField,
  nonHelperColumns,
  queryBuilderProps,
  getFilterComponent,
} = useTableStore()

// Layout
const queryBuilderEl = useTemplateRef('queryBuilderEl')
const queryBuilder = defineModel<IQueryBuilderRow[]>('queryBuilder', { default: () => [] })

const nonHelperFilterableColumns = computed(() => {
  return nonHelperColumns.value.filter(col => col.filterable)
})

function handleUpdateColumnFilter(columnFilter: IQueryBuilderItem) {
  const modifiedColumnFilters = queryBuilderEl.value
    ?.getModifiedColumnFilter(columnFilter) as Array<{ field: string, filterField?: string, filters: IQueryBuilderItem[] }>

  modifiedColumnFilters.forEach(col => {
    const column = internalColumns.value.find(c => c.field === col.field)

    if (column) {
      column.filters = [
        ...column.filters.filter(f => f.nonInteractive),
        ...col.filters.map(f => new FilterItem({
          ...column,
          ...f,
          field: col.field,
          filterField: col.filterField ?? col.field,
        })),
      ]
    }
  })
}

function handleRemoveColumnFilter(columnFilter: IQueryBuilderItem) {
  const column = internalColumnsByField.value[columnFilter.field]

  if (column) {
    column.filters = column.filters.filter(f => f.id !== columnFilter.id)
  }
}

// Constants
const MIN_VISIBLE_QUERY_BUILDER_ROWS = 1
const MAX_VISIBLE_QUERY_BUILDER_ROWS = 2
const QUERY_BUILDER_INLINE_ROW_HEIGHT = 28
const QUERY_BUILDER_INLINE_PADDING = 8
const QUERY_BUILDER_INLINE_GAP = 4

function getQueryBuilderHeight(rows: number) {
  return rows * QUERY_BUILDER_INLINE_ROW_HEIGHT
    + (rows - 1) * QUERY_BUILDER_INLINE_GAP
    + QUERY_BUILDER_INLINE_PADDING
}

const queryBuilderHeight = computed(() => {
  return {
    minHeight: `${getQueryBuilderHeight(MIN_VISIBLE_QUERY_BUILDER_ROWS)}px`,
    maxHeight: `${getQueryBuilderHeight(MAX_VISIBLE_QUERY_BUILDER_ROWS)}px`,
  }
})
</script>

<template>
  <VerticalScroller>
    <QueryBuilderInline
      ref="queryBuilderEl"
      v-bind="queryBuilderProps"
      v-model:items="queryBuilder"
      :columns="nonHelperFilterableColumns"
      :style="queryBuilderHeight"
      show-column-filters
      :get-filter-component
      @update:column-filter="handleUpdateColumnFilter"
      @remove:column-filter="handleRemoveColumnFilter"
    />
  </VerticalScroller>
</template>

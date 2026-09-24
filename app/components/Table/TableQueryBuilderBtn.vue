<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { IQueryBuilderItem } from '../QueryBuilder/types/query-builder-item-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'queryBuilder' | 'queryBuilderProps'>

const props = defineProps<IProps>()

// Store
const {
  internalColumnsByField,
  nonHelperColumns,
  getFilterComponent,
} = useTableStore()

// Layout
const queryBuilderEl = useTemplateRef('queryBuilderEl')

const nonHelperFilterableColumns = computed(() => {
  return nonHelperColumns.value.filter(col => col.filterable)
})

const {
  model: queryBuilder,
  syncFromParent,
  syncToParent,
} = useRefReset(() => props.queryBuilder ?? [])

const queryBuilderHasChildren = computed(() => {
  return queryBuilder.value?.some(item => {
    return 'children' in item && item.children?.length
  })
})

async function handleSubmit() {
  const { isValid } = validation.validate()

  if (!isValid) {
    return
  }

  // Sync the column filters
  const modifiedColumnFilters = queryBuilderEl.value
    ?.getModifiedColumnFilters() as Array<{ field: string, filters: IQueryBuilderItem[] }>

  modifiedColumnFilters?.forEach(col => {
    const column = internalColumnsByField.value[col.field]

    if (column) {
      column.filters = [
        ...column.filters.filter(f => f.nonInteractive),
        ...col.filters.map(f => new FilterItem({ ...column, ...f })),
      ]
    }
  })

  syncToParent()
  $hide()
}

onMounted(() => {
  nextTick(syncFromParent)
})

const { validation } = useArk({ scope: '_qb' })
</script>

<template>
  <Btn
    size="sm"
    no-uppercase
    no-dim
    class="qb-dialog-btn"
    :class="{ 'is-active': queryBuilderHasChildren }"
    icon="i-lucide:list-filter"
  >
    <Tooltip
      placement="top"
      :offset="8"
    >
      {{ $t('queryBuilder.self') }}
    </Tooltip>

    <Dialog
      :title="$t('queryBuilder.self')"
      w="280"
      max-h="90%"
      min-h="100"
      h="auto"
      position="top"
      dense
      @before-show="syncFromParent"
      @hide="syncFromParent"
    >
      <Form
        :label="$t('general.apply')"
        :submit-confirmation="false"
        :focus-first-input="false"
        no-edit-controls
        :ui="{
          controlsClass: ({ defaults }) => `${defaults.all} !p-t-1`,
          contentClass: () => `relative flex flex-col grow overflow-auto gap-2`,
        }"
        :submit-btn-props="{ size: 'sm' }"
        @submit="handleSubmit"
      >
        <QueryBuilder
          ref="queryBuilderEl"
          v-bind="queryBuilderProps"
          v-model:items="queryBuilder"
          :columns="nonHelperFilterableColumns"
          editable
          :get-filter-component
        />
      </Form>
    </Dialog>
  </Btn>
</template>

<style scoped lang="scss">
.qb-dialog-btn {
  @apply border-1 border-true-gray-200 dark:border-true-gray-700 bg-white dark:bg-true-gray-900
    color-true-gray-600 dark:color-true-gray-300 rounded-lg;

  &:hover {
    @apply bg-true-gray-50 dark:bg-true-gray-800 color-true-gray-900 dark:color-white;
  }

  &.is-active {
    @apply border-primary/40 bg-primary/8 color-primary dark:bg-primary/30 dark:color-white;
  }
}
</style>

<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Models
import { FilterItem } from '$utils'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'queryBuilder' | 'queryBuilderProps'>

const props = defineProps<IProps>()

// Store
const { internalColumnsByField, nonHelperColumns } = storeToRefs(useTableStore())

// Layout
const queryBuilderEl = useTemplateRef('queryBuilderEl')

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
  const isValid = await $z.value.$validate()

  if (!isValid) {
    return
  }

  // Sync the column filters
  const modifiedColumnFilters = queryBuilderEl.value?.getModifiedColumnFilters() ?? []

  modifiedColumnFilters.forEach(col => {
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

const $z = useZod({ scope: 'qb' })
</script>

<template>
  <Btn
    size="sm"
    no-uppercase
    outlined
    :class="queryBuilderHasChildren ? 'color-primary' : 'color-ca'"
    icon="i-basil:filter-solid"
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
      @before-show="syncFromParent"
      @hide="syncFromParent"
    >
      <Form
        :label="$t('general.apply')"
        :submit-confirmation="false"
        :focus-first-input="false"
        no-edit-controls
        :ui="{ controlsClass: 'p-x-0 p-b-0 p-t-1 border-t-1 border-ca' }"
        :submit-btn-props="{ size: 'sm' }"
        @submit="handleSubmit"
      >
        <QueryBuilder
          ref="queryBuilderEl"
          v-bind="queryBuilderProps"
          v-model:items="queryBuilder"
          :columns="nonHelperColumns"
          editable
        />
      </Form>
    </Dialog>
  </Btn>
</template>

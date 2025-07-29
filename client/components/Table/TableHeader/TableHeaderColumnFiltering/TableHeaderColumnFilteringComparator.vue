<script setup lang="ts">
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ITableFilterItem } from '../../types/table-filter-item.type'

// Models
import type { TableColumn } from '../../models/table-column.model'

// Functions
import { getAvailableComparators } from '../../functions/get-available-comparators'
import { useQueryBuilderItemUtils } from '../../../QueryBuilder/functions/useQueryBuilderItemUtils'

// Store
import { useTableStore } from '../../stores/table2.store'

type IProps = {
  column: TableColumn
  editable?: boolean
  extraComparators?: ComparatorEnum[]
  item: ITableFilterItem
}

const props = defineProps<IProps>()

const emits = defineEmits<{
  (e: 'update:comparator', val: ComparatorEnum): void
}>()

defineExpose({
  focus: () => comparatorInputEl.value?.focus(),
})

// Store
const { allowComparatorsOfSameType } = useTableStore()

// Layout
const comparatorInputEl = useTemplateRef('comparatorInputEl')
const item = toRef(props, 'item')
const column = toRef(props, 'column')

const {
  checkIsSelectorComparator,
  checkIsNonValueComparator,
} = useQueryBuilderItemUtils(item)

const comparators = computed(() => {
  if (!column.value) {
    return []
  }

  return getAvailableComparators(column.value.dataType, {
    includeSelectorComparators: !!column.value.getDistinctData,
    allowedComparators: column.value.comparators,
    extraComparators: [
      ...(column.value.extraComparators ?? []),
      ...(props.extraComparators ?? []),
    ],
  }).map(comparator => ({
    id: comparator,
    label: $t(`comparator.${comparator.replaceAll('.', '|')}`),
  }))
})

const usedComparators = computed(() => {
  if (!column.value || allowComparatorsOfSameType.value) {
    return []
  }

  return column.value.filters.map(filter => filter.comparator)
})

function handleComparatorChange(comparator: ComparatorEnum) {
  // If the comparator was a selector comparator and now it's not, reset the value
  // If the comparator was not a selector comparator and now it is, reset the value
  const wasSelectComparator = checkIsSelectorComparator(item.value.comparator)
  const isSelectComparator = checkIsSelectorComparator(comparator)

  // Same for empty comparator
  const wasEmptyComparator = checkIsNonValueComparator(item.value.comparator)
  const _isEmptyComparator = checkIsNonValueComparator(comparator)

  if (wasSelectComparator && !isSelectComparator) {
    item.value.value = undefined
  }

  if (!wasSelectComparator && isSelectComparator) {
    item.value.value = []
  }

  if (wasEmptyComparator && !_isEmptyComparator) {
    item.value.value = undefined
  }

  if (!wasEmptyComparator && _isEmptyComparator) {
    item.value.value = undefined
  }

  item.value.comparator = comparator
  emits('update:comparator', comparator)
}
</script>

<template>
  <!-- Comparator selector -->
  <Selector
    ref="comparatorInputEl"
    :model-value="item.comparator"
    :options="comparators"
    emit-key
    size="sm"
    :readonly="!editable"
    :list-props="{ hiddenItems: usedComparators }"
    data-cy="comparator"
    @update:model-value="handleComparatorChange"
  />
</template>

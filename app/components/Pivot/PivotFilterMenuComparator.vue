<script setup lang="ts" generic="T extends IItem = IItem">
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ITableFilterItem } from '../Table/types/table-filter-item.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'

// Functions
import { getAvailableComparators } from '../Table/functions/get-available-comparators'
import { useQueryBuilderItemUtils } from '../QueryBuilder/functions/useQueryBuilderItemUtils'

type IProps = {
  column: TableColumn<T>
  editable?: boolean
  extraComparators?: ComparatorEnum[]
  item: ITableFilterItem<T>
}

const props = defineProps<IProps>()

const emits = defineEmits<{
  (e: 'update:comparator', val: ComparatorEnum): void
}>()

defineExpose({
  focus: () => comparatorInputEl.value?.focus(),
})

const comparatorInputEl = useTemplateRef('comparatorInputEl')
const item = toRef(props, 'item')
const column = toRef(props, 'column')

const {
  checkIsSelectorComparator,
  checkIsNonValueComparator,
} = useQueryBuilderItemUtils(item as Ref<ITableFilterItem>)

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
  if (!column.value) {
    return []
  }

  return column.value.filters.map(filter => filter.comparator)
})

function handleComparatorChange(comparator: ComparatorEnum) {
  const wasSelectComparator = checkIsSelectorComparator(item.value.comparator)
  const isSelectComparator = checkIsSelectorComparator(comparator)
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
  >
    <template #option="{ item }">
      {{ item.label }}

      <Tooltip
        placement="right"
        :content="{
          title: item.label,
          description: $t(`comparator.${item.id.replaceAll('.', '|')}Description`),
        }"
      />
    </template>
  </Selector>
</template>

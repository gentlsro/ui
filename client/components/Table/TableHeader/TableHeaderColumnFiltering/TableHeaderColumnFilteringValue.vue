<script setup lang="ts">
// Types
import type { ITableFilterItem } from '../../types/table-filter-item.type'

// Models
import type { TableColumn } from '../../models/table-column.model'

// Functions
import { getInputByDataType } from '../../../Inputs/DynamicInput/constants/input-by-datatype'
import { useQueryBuilderItemUtils } from '../../../QueryBuilder/functions/useQueryBuilderItemUtils'

type IProps = {
  column: TableColumn
  editable?: boolean
  item: ITableFilterItem
}

const props = defineProps<IProps>()
defineExpose({
  focus: () => valueInputEl.value?.focus(),
})

// Layout
const valueInputEl = ref<any>()
const item = toRef(props, 'item')
const column = toRef(props, 'column')

const {
  isNonValueComparator,
  isSelectorComparator,
  isBooleanishComparator,
  canUseSelectorComparator,
} = useQueryBuilderItemUtils(item)

// Custom filter component
const component = getInputByDataType(column.value.dataType || 'string')

const customFilterComponent = computed(() => {
  const customFilterComponent = column.value?.filterComponent
  const isValidComparator = customFilterComponent?.comparators.includes(item.value.comparator)

  // When using a comparator that is defined to have a custom filter component, we use it
  if (customFilterComponent && isValidComparator) {
    return customFilterComponent
  }

  // Otherwise, we don't return anything
  return undefined
})

// Custom filter component may have its own getter and setter
const filterValue = computed({
  get() {
    if (customFilterComponent.value?.valueFormatter) {
      return customFilterComponent.value.valueFormatter.getter(item.value.value)
    }

    return item.value.value
  },
  set(value) {
    const val = value

    if (customFilterComponent.value?.valueFormatter) {
      item.value.value = customFilterComponent.value.valueFormatter.setter(val)

      return
    }

    item.value.value = typeof val === 'string' ? val.trim() : val
  },
})

// Comparators `ComparatorEnum.IN` and `ComparatorEnum.NOT_IN` should be handled
// as a simple string but must return an array
// NOTE: Having `getDstinctData` means we don't need to use `inValueSimple` as
// we have the values to use in the `Selector`
const isInValueSimple = computed(() => {
  return !column.value?.getDistinctData && canUseSelectorComparator(item.value.comparator, column.value)
})

const inValueSimple = computed({
  get() {
    return item.value.value?.join(',')
  },
  set(value: string) {
    if (value === '') {
      item.value.value = undefined

      return
    }

    const cleanedInput = value.replace(/,\s*$/, '').trim()

    item.value.value = cleanedInput.split(',').map(s => s.trim())
  },
})

// A selector for distinct data should be used
const isDistinctDataSelector = computed(() => {
  return column.value?.getDistinctData && canUseSelectorComparator(item.value.comparator, column.value)
})

const filterComponentProps = computed(() => {
  // When using custom filter component, we use its additional props
  if (customFilterComponent.value) {
    const props = typeof customFilterComponent.value.props === 'function'
      ? customFilterComponent.value.props(filterValue.value, column.value)
      : customFilterComponent.value.props

    return props
  }

  if (!column.value?.filterComponentProps) {
    return
  }

  const props = typeof column.value.filterComponentProps === 'function'
    ? column.value.filterComponentProps(item.value, column.value)
    : column.value.filterComponentProps

  return props
})
</script>

<template>
  <!-- Custom filter component -->
  <Component
    :is="customFilterComponent.component"
    v-if="customFilterComponent"
    ref="valueInputEl"
    v-model="filterValue"
    :readonly="!editable"
    v-bind="filterComponentProps"
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    data-cy="qb-item__content-value"
  />

  <!-- Selector for `Comparator.IN` and `Comparator.NOT_IN` for simple cases -->
  <TextInput
    v-else-if="isInValueSimple"
    ref="valueInputEl"
    v-model="inValueSimple"
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    empty-value=""
    :readonly="!editable"
    data-cy="qb-item__content-value"
  />

  <!-- Selector of distinct values -->
  <Selector
    v-else-if="isDistinctDataSelector"
    v-bind="filterComponentProps"
    ref="valueInputEl"
    v-model="item.value"
    :load-data="{ fnc: column?.getDistinctData }"
    :multi="isSelectorComparator"
    emit-key
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    :readonly="!editable"
    data-cy="qb-item__content-value"
  />

  <!-- $Empty/Boolean value -->
  <QueryBuilderBooleanInput
    v-else-if="isBooleanishComparator"
    :item
    no-delete
    :readonly="!editable"
  />

  <!-- Primitive value -->
  <Component
    :is="component.component"
    v-else-if="component?.component && !isNonValueComparator"
    ref="valueInputEl"
    v-model="filterValue"
    size="sm"
    :class="{ 'qb-item__content-value': column.dataType !== 'boolean' }"
    :readonly="!editable"
    v-bind="component.props"
    :placeholder="$t('queryBuilder.value')"
    data-cy="qb-item__content-value"
  />
</template>

<script setup lang="ts" generic="T extends IItem = IItem">
import utilsConfig from '$utilsConfig'

// Types
import type { IInputProps } from '../Inputs/types/input-props.type'
import type { ITableFilterItem } from '../Table/types/table-filter-item.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'

// Functions
import { getInputByDataType } from '../Inputs/DynamicInput/constants/input-by-datatype'
import { useQueryBuilderItemUtils } from '../QueryBuilder/functions/useQueryBuilderItemUtils'

type IProps = {
  column: TableColumn<T>
  editable?: boolean
  item: ITableFilterItem<T>
}

const props = defineProps<IProps>()
defineExpose({
  focus: () => requestAnimationFrame(() => valueInputEl.value?.focus?.()),
})

const valueInputEl = ref<any>()
const item = toRef(props, 'item')
const column = toRef(props, 'column')

const {
  isNonValueComparator,
  isSelectorComparator,
  isBooleanishComparator,
  canUseSelectorComparator,
} = useQueryBuilderItemUtils(item as Ref<ITableFilterItem>)

const component = computed(() => getInputByDataType(column.value.dataType || 'string'))

const columnFilterComponentC = toRaw(column.value?.filterComponent?.component)

const customFilterComponent = computed(() => {
  const columnFilterComponent = column.value?.filterComponent
  const isValidComparator = !columnFilterComponent?.comparators.length
    || columnFilterComponent?.comparators.includes(item.value.comparator)

  if (columnFilterComponent && isValidComparator) {
    return {
      ...columnFilterComponent,
      component: columnFilterComponentC,
    }
  }

  return undefined
})

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

const isInValueSimple = computed(() => {
  return !column.value?.getDistinctData && canUseSelectorComparator(
    item.value.comparator,
    column.value as TableColumn,
  )
})

const inInputProps = computed(() => {
  const isNumberDataType = utilsConfig.dataTypeExtend.numberDataTypes.includes(column.value.dataType)

  if (isNumberDataType) {
    return {
      mask: {
        mask: /^[0-9,.\s]+$/,
      },
    } as IInputProps
  }

  return {}
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

const isDistinctDataSelector = computed(() => {
  return column.value?.getDistinctData && canUseSelectorComparator(
    item.value.comparator,
    column.value as TableColumn,
  )
})

const filterComponentProps = computed(() => {
  if (customFilterComponent.value) {
    const props = typeof customFilterComponent.value.props === 'function'
      ? customFilterComponent.value.props(item.value as ITableFilterItem, column.value as TableColumn)
      : customFilterComponent.value.props

    return props
  }

  if (!column.value?.filterComponentProps) {
    return
  }

  const props = typeof column.value.filterComponentProps === 'function'
    ? column.value.filterComponentProps(item.value as ITableFilterItem, column.value as TableColumn)
    : column.value.filterComponentProps

  return props
})
</script>

<template>
  <span v-if="isNonValueComparator" />

  <Component
    :is="customFilterComponent.component"
    v-else-if="customFilterComponent"
    ref="valueInputEl"
    v-model="filterValue"
    :readonly="!editable"
    v-bind="filterComponentProps"
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    data-cy="qb-item__content-value"
  />

  <TextInput
    v-else-if="isInValueSimple"
    ref="valueInputEl"
    v-model="inValueSimple"
    v-bind="inInputProps"
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    empty-value=""
    :readonly="!editable"
    data-cy="qb-item__content-value"
  />

  <Selector
    v-else-if="isDistinctDataSelector"
    v-bind="filterComponentProps"
    ref="valueInputEl"
    v-model="item.value"
    :load-data="{ fnc: column?.getDistinctData, payloadKey: null }"
    :multi="isSelectorComparator"
    emit-key
    size="sm"
    :placeholder="`${$t('table.filterValue')}...`"
    :readonly="!editable"
    data-cy="qb-item__content-value"
  />

  <QueryBuilderBooleanInput
    v-else-if="isBooleanishComparator"
    v-model="filterValue"
    no-delete
    :readonly="!editable"
  />

  <Component
    :is="component.component"
    v-else-if="component?.component"
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

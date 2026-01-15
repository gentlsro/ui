<script setup lang="ts">
// Models
import { FilterItem } from '$utils'
import type { ComparatorEnum } from '$comparatorEnum'

// Functions
import { useTableStore } from './stores/table.store'

// Constants
import { NON_VALUE_COMPARATORS } from '#layers/utilities/shared/constants/comparators-by-category.const'
import { type } from 'arktype'

type IProps = {
  filter: FilterItem
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = useTableStore()

// Utils
const { currentLocaleCode } = useLocale()

// Layout
const menuEl = useTemplateRef('menuEl')
const itemEditEl = useTemplateRef('itemEditEl')

// We create a local copy of the filter to avoid triggering query params with every change
const {
  model: filterLocal,
  syncFromParent,
  syncToParent,
} = useRefReset(() => props.filter, { modifyFnc: val => new FilterItem(val) })

const formattedValue = computed(() => {
  const format = props.filter.filterFormat
    ?? props.filter.format
    ?? column.value?.filterFormat
    ?? column.value?.format

  return formatValue(
    props.filter.value,
    undefined,
    { dataType: props.filter.dataType, format, localeIso: currentLocaleCode.value },
  )
})

const column = computed(() => {
  return internalColumns.value.find(col => col.field === props.filter.field)
})

function handleRemoveFilter() {
  const filterIdx = column.value?.filters.findIndex(f => f.id === props.filter.id) ?? -1

  if (filterIdx > -1 && column.value) {
    column.value.filters = column.value.filters.toSpliced(filterIdx, 1)
  }
}

async function handleSubmit() {
  const { isValid } = $ark.validate()

  if (isValid) {
    menuEl.value?.hide(true)
  }
}

function handleMenuBeforeShow() {
  syncFromParent()
}

function handleMenuBeforeHide() {
  if (!column.value) {
    return
  }

  syncToParent()

  column.value.filters = column.value.filters.filter(filter => {
    const isNonValueComparator = NON_VALUE_COMPARATORS
      .includes(filter.comparator)

    const isUndefinedValue = filter.value === undefined
    const isEmptyArray = Array.isArray(filter.value) && !filter.value.length

    return (
      (!isUndefinedValue && !isEmptyArray)
      || isNonValueComparator
      || filter.nonInteractive
    )
  })
}

const { $ark } = useArk({
  state: filterLocal,
  schema: type({
    'field': 'string',
    'comparator': 'string',
    'value?': 'unknown.any',
  }).narrow(data => {
    const comparator = data.comparator
    const value = data.value
    const isNonValueComparator = NON_VALUE_COMPARATORS.includes(comparator as ComparatorEnum)

    if (isNonValueComparator) {
      return isNil(value)
    }

    return !isNil(value)
  }),
  scope: '_qb',
})
</script>

<template>
  <div class="table-filter-chip">
    <!-- Label -->
    <span class="table-filter-chip__label">
      {{ column?._label }}
    </span>

    <!-- Comparator -->
    <span class="table-filter-chip__comparator">
      {{ $t(`comparator.${filter.comparator.replaceAll('.', '|')}`) }}
    </span>

    <!-- Value -->
    <span class="table-filter-chip__value">
      {{ formattedValue }}
    </span>

    <!-- Remove btn -->
    <Btn
      size="auto"
      icon="i-ion:close !w-3.5 !h-3.5"
      color="negative"
      w="5"
      h="5"
      @click="handleRemoveFilter"
    />

    <MenuProxy
      v-if="column"
      ref="menuEl"
      :no-arrow="false"
      w="70"
      @before-show="handleMenuBeforeShow"
      @before-hide="handleMenuBeforeHide"
      @show="itemEditEl?.focus()"
    >
      <Form
        no-controls
        dense
        :focus-first-input="false"
        :submit-confirmation="false"
        @submit="handleSubmit"
      >
        <TableHeaderColumnFilteringItem
          ref="itemEditEl"
          :column
          :item="filterLocal"
          @remove:item="handleRemoveFilter"
        />
      </Form>
    </MenuProxy>
  </div>
</template>

<style scoped lang="scss">
.table-filter-chip {
  @apply relative flex items-center gap-1.5 p-r-1 p-l-3 p-y-1 rounded-custom font-rem-12
  border-1 border-ca cursor-pointer;

  &__label {
    @apply font-semibold truncate max-w-30;
  }

  &__comparator {
    @apply text-caption whitespace-nowrap lowercase font-rem-12;
  }

  &__value {
    @apply font-semibold;
  }

  &::before {
    @apply content-empty absolute top--1px bottom--1px left--1px w-6px bg-primary rounded-l-custom;
  }
}
</style>

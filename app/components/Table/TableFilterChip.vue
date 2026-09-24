<script setup lang="ts">
import { type } from 'arktype'
import type { ComparatorEnum } from '$comparatorEnum'

// Functions
import { useTableStore } from './stores/table.store'

type IProps = {
  filter: FilterItem
}

const props = defineProps<IProps>()

// Constants
const NON_VALUE_COMPARATORS = getNonValueComparators()

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
	    {
	      dataType: props.filter.dataType,
      format,
      localeIso: currentLocaleCode.value,
      source: { type: 'component', name: 'TableFilterChip' },
    },
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
  const { isValid } = validation.validate()

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

const { validation } = useArk({
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
      size="xs"
      icon="i-lucide:x"
      class="table-filter-chip__remove"
      @click.stop="handleRemoveFilter"
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
@use '#layers/ui/app/css/subtle-remove-btn-mixin.scss' as *;

.table-filter-chip {
  @apply relative flex items-center gap-1 shrink-0 min-h-7 p-l-2 p-r-0.5 rounded-lg font-rem-12
    border-1 border-true-gray-200 dark:border-true-gray-700 bg-white dark:bg-true-gray-900
    cursor-pointer transition-colors;

  &:hover {
    @apply border-true-gray-300 dark:border-true-gray-600 bg-true-gray-50 dark:bg-true-gray-800;
  }

  &__label {
    @apply font-medium truncate max-w-30 color-true-gray-800 dark:color-true-gray-100;
  }

  &__comparator {
    @apply whitespace-nowrap lowercase color-true-gray-500 dark:color-true-gray-400;
  }

  &__value {
    // Even 20px height (see the inline query builder value), so it sits on whole pixels
    @apply rounded-md p-x-1.5 p-y-2px leading-4 font-medium min-w-5 text-center max-w-60 truncate
      bg-primary/10 color-primary dark:bg-primary/40 dark:color-white;
  }

  &__remove {
    @include subtle-remove-btn;
  }
}
</style>

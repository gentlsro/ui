<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableTotal } from './types/table-total.type'

// Models
import type { TableColumn } from './models/table-column.model'

// Functions
import { tableIsNumericColumn } from './functions/table-is-numeric-column'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'ui'> & {
  column: TableColumn
  total?: ITableTotal
}

const props = defineProps<IProps>()

// Utils
const { currentLocale } = useLocale()
const { getColumnWidth, getFrozenStyle } = useTableStore()

const totalsCellClass = computed(() => {
  return [
    props.ui?.totalsCellClass?.({
      column: props.column,
      defaults: TABLE_DEFAULT_PROPS.ui.totalsCellClass(),
    }),
    props.column.totalsCellClass,
    { 'is-numeric': tableIsNumericColumn(props.column) },
  ]
})

const totalsCellStyle = computed(() => {
  return {
    ...props.ui?.totalsCellStyle?.({
      column: props.column,
    }),
    ...props.column.totalsCellStyle,
    ...getFrozenStyle(props.column),
    '--colWidth': getColumnWidth(props.column),
  }
})

const totalText = computed(() => {
  if (isNil(props.total?.value)) {
    return ''
  }

  const valueFormatted = formatValue(props.total?.value, undefined, {
    dataType: props.total?.dataType,
    localeIso: currentLocale.value.code,
    source: { type: 'component', name: 'TableTotalsCell' },
  })

  const label = typeof props.total?.label === 'function'
    ? props.total?.label()
    : props.total?.label

  // The column header already names the value, so only a different label is shown
  const labelEl = label && label !== props.column._label
    ? `<span class="whitespace-nowrap font-normal color-true-gray-500 dark:color-true-gray-400">${label}</span>`
    : ''

  const valueEl = !isNil(props.total?.value)
    ? `<span font="semibold">${valueFormatted}</span>`
    : ''

  return `${labelEl}${valueEl}`
})
</script>

<template>
  <div
    class="th"
    :class="totalsCellClass"
    :style="totalsCellStyle"
  >
    <slot>
      <span
        class="th__totals-inner"
        v-html="totalText"
      />
    </slot>
  </div>
</template>

<style scoped lang="scss">
.th {
  @apply flex shrink-0
    w-$colWidth;

  &__totals-inner {
    @apply flex gap-2 items-center;
  }

  &.is-numeric {
    @apply justify-end tabular-nums;
  }

  // The row's "Total" label starts where the row does, whatever the column's alignment
  &.is-label {
    @apply justify-start;
  }
}
</style>

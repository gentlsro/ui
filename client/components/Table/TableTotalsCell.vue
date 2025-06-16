<script setup lang="ts">
import { formatValue } from '$utils'

// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableTotal } from './types/table-total.type'

// Models
import type { TableColumn } from './models/table-column.model'

type IProps = Pick<ITableProps, 'ui'> & {
  column: TableColumn
  total?: ITableTotal
}

const props = defineProps<IProps>()

// Utils
const { currentLocale } = useLocale()

const totalsCellClass = computed(() => {
  return [props.ui?.totalsCellClass, props.column.totalsCellClass]
})

const totalsCellStyle = computed(() => {
  return {
    ...props.ui?.totalsCellStyle,
    ...props.column.totalsCellStyle,
    '--colWidth': props.column.width,
  }
})

const totalText = computed(() => {
  if (isNil(props.total?.value)) {
    return ''
  }

  const valueFormatted = formatValue(props.total?.value, undefined, {
    dataType: props.total?.dataType,
    localeIso: currentLocale.value.code,
  })

  const label = typeof props.total?.label === 'function'
    ? props.total?.label()
    : props.total?.label

  const labelEl = label
    ? `<span text="caption">${label}:</span>`
    : ''

  const valueEl = props.total?.value
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
  @apply flex shrink-0;
  @apply w-$colWidth;

  &__totals-inner {
    @apply flex gap-2 items-center;
  }
}
</style>

<script setup lang="ts">
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

  const label = typeof props.total?.label === 'function'
    ? props.total?.label()
    : props.total?.label

  const labelEl = label
    ? `<span text="caption">${label}</span>`
    : ''

  const valueEl = props.total?.value
    ? `<span font="semibold">${props.total?.value}</span>`
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
  @apply flex flex-center shrink-0;
  @apply w-$colWidth;

  &__totals-inner {
    @apply flex gap-1 items-center;
  }
}
</style>

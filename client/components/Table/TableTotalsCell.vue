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

  return `${label ? `${label}:` : ''}${props.total?.value}`
})
</script>

<template>
  <div
    class="th"
    :class="totalsCellClass"
    :style="totalsCellStyle"
  >
    <slot>
      <span class="th__totals-inner">
        {{ totalText }}
      </span>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.th {
  @apply flex flex-center shrink-0;
  @apply w-$colWidth;
}
</style>

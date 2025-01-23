<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Models
import type { TableColumn } from './models/table-column.model'

type IProps = Pick<ITableProps, 'ui'> & {
  column: TableColumn
}

const props = defineProps<IProps>()

const totalsCellClass = computed(() => {
  return [props.column.totalsCellClass]
})

const totalsCellStyle = computed(() => {
  return {
    ...props.column.totalsCellStyle,
    '--colWidth': props.column.width,
  }
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
      >
        Total...
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

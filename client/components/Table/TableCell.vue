<script setup lang="ts">
// Models
import type { ITableProps } from './types/table-props.type'
import type { TableColumn } from './models/table-column.model'

type IProps = Pick<ITableProps, 'ui'> & {
  column: TableColumn
  row: IItem
}

const props = defineProps<IProps>()

// Layout
const cellValue = computed(() => {
  return props.column.valueGetter(props.row)
})

const classes = computed(() => {
  // Cell
  const columnCellClass = typeof props.column.cellClass === 'function'
    ? props.column.cellClass(props.row)
    : props.column.cellClass

  const rowCellClass = typeof props.ui?.cellClass === 'function'
    ? props.ui?.cellClass(props.row, props.column)
    : props.ui?.cellClass

  // Cell inner
  const rowCellInnerClass = typeof props.ui?.cellInnerClass === 'function'
    ? props.ui?.cellInnerClass(props.row, props.column)
    : props.ui?.cellInnerClass

  return {
    cell: [columnCellClass, rowCellClass],
    cellInner: rowCellInnerClass,
  }
})

const styles = computed(() => {
  // Cell
  const columnCellStyle = typeof props.column.cellStyle === 'function'
    ? props.column.cellStyle(props.row)
    : props.column.cellStyle

  const rowCellStyle = typeof props.ui?.cellStyle === 'function'
    ? props.ui?.cellStyle(props.row, props.column)
    : props.ui?.cellStyle

  // Cell inner
  const rowCellInnerStyle = typeof props.ui?.cellInnerStyle === 'function'
    ? props.ui?.cellInnerStyle(props.row, props.column)
    : props.ui?.cellInnerStyle

  return {
    cell: Object.assign({}, columnCellStyle, rowCellStyle, { '--colWidth': props.column.width }),
    cellInner: rowCellInnerStyle,
  }
})

const linkProps = computed(() => {
  return {
    to: props.column.link?.(props.row) || undefined,
    ...props.column.linkProps,
  }
})
</script>

<template>
  <div
    class="td"
    :style="styles.cell"
    :class="classes.cell"
  >
    <slot>
      <Checkbox
        v-if="column.field === '_selectable'"
        size="sm"
      />

      <ValueFormatter
        v-else
        :value="cellValue"
        :data-type="column.dataType"
        :format="column.format"
        :row
      >
        <template #default="{ val }">
          <!-- Boolean -->
          <Checkbox
            v-if="column.dataType === 'boolean'"
            :model-value="cellValue"
            size="sm"
            :label="val"
            :editable="false"
            tabindex="-1"
            :visuals="{ checked: { checkbox: '!bg-primary !border-primary' } }"
          />

          <!-- Link -->
          <NuxtLink
            v-else-if="linkProps.to"
            v-bind="linkProps"
            class="link"
            @click.stop.prevent
          >
            {{ val }}
          </NuxtLink>

          <span
            v-else
            :style="styles.cellInner"
            :class="classes.cellInner"
          >
            {{ val }}
          </span>
        </template>
      </ValueFormatter>
    </slot>
  </div>
</template>

<style scoped lang="scss">
.td {
  @apply flex items-center border-ca;
  @apply w-$colWidth;

  .link {
    @apply truncate;
  }
}

.separator--vertical,
.separator--cell {
  .td {
    @apply border-r-1;
  }
}

.separator--horizontal,
.separator--cell {
  .td {
    @apply border-b-1;
  }

  .td:first-child {
    @apply border-l-1;
  }
}
</style>

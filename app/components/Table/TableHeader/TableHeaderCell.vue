<script setup lang="ts">
// Types
import type { ITableProps } from '../types/table-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'
import { getListItemKey } from '../../List/functions/helpers'

// Functions
import { tableIsNumericColumn } from '../functions/table-is-numeric-column'

// Constants
import { TABLE_DEFAULT_PROPS } from '../constants/table-default-props.constant'

type IProps = Pick<ITableProps, 'ui'> & {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const {
  rowKey,
  rows,
  selection,
  selectionConfig,
  selectionByKey,
  features,
  isCardView,
  getColumnWidth,
  frozenOffsets,
  getFrozenStyle,
} = useTableStore()

// Layout
const hasFilterBtn = computed(() => {
  if (props.column.isHelperCol || props.column.nonInteractive) {
    return false
  }

  return props.column.filterable || props.column.sortable
})

// Freeze button
const hasFreezeBtn = computed(() => {
  const featureIncludesFreeze = features.value?.includes('freeze')
  const col = props.column

  return !col.isHelperCol
    && featureIncludesFreeze
    && !col.noFreeze
})

// Visuals
const headerClass = computed(() => {
  return [
    props.ui?.headerCellClass?.({
      column: props.column,
      defaults: TABLE_DEFAULT_PROPS.ui.headerCellClass(),
    }),
    props.column.headerClass,
    {
      'is-helper-col': props.column.isHelperCol,
      'is-numeric': !isCardView.value && tableIsNumericColumn(props.column),
      'is-frozen': props.column.field in frozenOffsets.value,
      'is-frozen-edge': !isCardView.value && props.column.frozen,
    },
  ]
})

const headerStyle = computed(() => {
  return {
    ...props.ui?.headerCellStyle?.({
      column: props.column,
    }),
    ...props.column.headerStyle,
    ...getFrozenStyle(props.column),
    '--colWidth': isCardView.value ? 'auto' : getColumnWidth(props.column),
  }
})

const headerInnerCellClass = computed(() => {
  return [
    props.ui?.headerCellInnerClass?.({
      column: props.column,
      defaults: TABLE_DEFAULT_PROPS.ui.headerCellInnerClass(),
    }),
    { 'p-x-2': isCardView.value },
  ]
})

const headerCellInnerStyle = computed(() => {
  return props.ui?.headerCellInnerStyle?.({
    column: props.column,
  })
})

// Selection
const rowKeys = computed(() => {
  return rows.value.map(row => getListItemKey(row, rowKey.value))
})

const selectionState = computed(() => {
  if (!selection.value || isEmpty(selection.value)) {
    return false
  }

  const isAllSelected = rowKeys.value.every(rowKey => {
    return selectionByKey.value[rowKey]
  })

  return isAllSelected ? true : null
})

function handleSelect() {
  // Some rows selected (indeterminate) → select all
  if (selectionState.value === null) {
    const toSelect = rowKeys.value.map((rowKey, idx) => {
      return selectionConfig.value?.emitKey ? rowKey : rows.value[idx]
    })

    selectionConfig.value?.onSelectAll?.(toSelect)
    selection.value = toSelect
  }

  // All rows selected → deselect all
  else if (selectionState.value === true) {
    selectionConfig.value?.onSelectAll?.([])
    selection.value = selectionConfig.value?.multi ? [] : undefined
  }

  // No rows selected → select all
  else {
    const toSelect = rowKeys.value.map((rowKey, idx) => {
      return selectionConfig.value?.emitKey ? rowKey : rows.value[idx]
    })

    selectionConfig.value?.onSelectAll?.(toSelect)
    selection.value = toSelect
  }
}
</script>

<template>
  <div
    class="th"
    :class="headerClass"
    :style="headerStyle"
    :data-column="column.field"
    :title="column._label"
  >
    <slot
      :column="column"
      :ui="{ headerInnerCellClass, headerCellInnerStyle }"
    >
      <template v-if="column.field === '_selectable'">
        <Checkbox
          v-if="selectionConfig?.multi"
          :model-value="selectionState"
          @update:model-value="handleSelect"
        />
      </template>

      <span
        v-else
        class="th__inner"
        :class="headerInnerCellClass"
        :style="headerCellInnerStyle"
      >
        {{ column._label }}
      </span>
    </slot>

    <div
      v-if="hasFilterBtn || hasFreezeBtn"
      class="th__actions"
    >
      <TableHeaderFreezeBtn
        v-if="hasFreezeBtn"
        :column
      />

      <TableHeaderFilterBtn
        v-if="hasFilterBtn"
        :column
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../styles/frozen-edge-shadow' as *;

.can-scroll-left .th.is-frozen-edge {
  border-right-width: 1px;
  @include frozen-edge-shadow(1);
}

.th {
  @apply flex items-center gap-1 shrink-0 border-true-gray-200 dark:border-true-gray-800 w-$colWidth;

  &__inner {
    @apply grow;
  }

  &__actions {
    @apply relative flex items-center;
  }

  // Numeric labels sit above their right-aligned values
  &.is-numeric {
    @apply flex-row-reverse p-l-1 p-r-2;

    .th__inner {
      @apply text-right;
    }

    // The freeze button opens towards the (usually empty) left side of the label
    :deep(.column-lock) {
      right: auto;
      left: calc(100% + 2px);
    }
  }
}

// Ties the revealed menu / freeze buttons to their column; stays while its menu is open
.th:not(.is-helper-col) {
  transition: background-color 0.15s ease-in-out;

  &:hover,
  &:has(.filter-btn.is-open) {
    @apply bg-true-gray-100 dark:bg-true-gray-800;
  }
}

.separator--vertical,
.separator--cell {
  .th:not(.is-last) {
    @apply border-r-1;
  }
}

.separator--horizontal,
.separator--cell {
  .th {
    @apply border-b-1;
  }
}
</style>

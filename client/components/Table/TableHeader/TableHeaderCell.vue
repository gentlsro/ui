<script setup lang="ts">
// Types
import type { ITableProps } from '../types/table-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'
import { getListItemKey } from '../../List/functions/helpers'

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
} = storeToRefs(useTableStore())

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

const freezeBtnClass = computed(() => {
  return hasFilterBtn.value ? 'left--9' : 'left--7'
})

// Visuals
const headerClass = computed(() => {
  return [
    props.ui?.headerCellClass,
    props.column.headerClass,
    { 'is-helper-col': props.column.isHelperCol },
  ]
})

const headerStyle = computed(() => {
  return {
    ...props.ui?.headerCellStyle,
    ...props.column.headerStyle,
    '--colWidth': isCardView.value ? 'auto' : props.column.width,
  }
})

const headerInnerCellClass = computed(() => {
  return [
    props.ui?.headerCellInnerClass,
    { 'p-x-2': isCardView.value },
  ]
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
  // Some selected
  if (selectionState.value === null) {
    const toSelect = rowKeys.value.map((rowKey, idx) => {
      return selectionConfig.value?.emitKey ? rowKey : rows.value[idx]
    })

    selection.value = toSelect
  }

  // All selected
  else if (selectionState.value === true) {
    selection.value = undefined
  }

  // Not all selected
  else {
    const toSelect = rowKeys.value.map((rowKey, idx) => {
      return selectionConfig.value?.emitKey ? rowKey : rows.value[idx]
    })

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
      :ui="{ headerInnerCellClass, headerCellInnerStyle: ui?.headerCellInnerStyle }"
    >
      <Checkbox
        v-if="column.field === '_selectable'"
        :model-value="selectionState"
        @update:model-value="handleSelect"
      />

      <span
        v-else
        class="th__inner"
        :class="headerInnerCellClass"
        :style="ui?.headerCellInnerStyle"
      >
        {{ column._label }}
      </span>
    </slot>

    <div class="th__actions">
      <TableHeaderFreezeBtn
        v-if="hasFreezeBtn"
        :column
        :class="freezeBtnClass"
      />

      <TableHeaderFilterBtn
        v-if="hasFilterBtn"
        :column
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.th {
  @apply flex items-center gap-2 shrink-0 border-ca;
  @apply w-$colWidth;

  &__inner {
    @apply grow;
  }

  &__actions {
    @apply relative flex items-center;
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

.table.is-bordered {
  .th {
    @apply border-y-1;
  }

  .th:first-child {
    @apply border-l-1;
  }

  .th.is-last {
    @apply border-r-1;
  }
}
</style>

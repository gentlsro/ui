<script setup lang="ts">
// NOTE: This is intentionally done in a single component to prevent spamming
// unnecessary creation of vue components for each cell and to keep consistency
// between card and regular views

// Types
import type { ITableProps } from './types/table-props.type'
import type { IRowColumn } from './types/table-row-column.type'

// Functions
import { tableSelectRow } from './functions/table-select-row'
import { formatValue } from '$utils/shared/functions/format-value'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'ui' | 'editable'> & {
  row: IItem | IItem[]
  index: number
}

defineOptions({ inheritAttrs: false })
const props = defineProps<IProps>()

// Helpers
function isSelected(row: IItem) {
  const key = selectionConfig.value?.selectionKey ?? rowKey.value

  return selectionByKey.value[get(row, key)]
}

function isEditingCell(rowData: typeof rowDataArray.value[number], column: IRowColumn) {
  return isEditingCellStore.value
    && cellEdit.value?.column === column.column
    && cellEdit.value?.row === rowData.row
}

// Store
const tableStore = useTableStore()
const {
  tableEl,
  rowKey,
  selection,
  selectionByKey,
  selectionConfig,
  visibleColumns,
  rowsColumnCount,
  isCardView,
  cellEdit,
  isEditingCell: isEditingCellStore,
  cellEditValue,
} = storeToRefs(tableStore)

// Layout
const [DefineValueTemplate, ReuseValueTemplate] = createReusableTemplate<{
  column: IRowColumn
  row: IItem
  isSelectable: boolean
}>()

const isEditableRow = computed(() => {
  return typeof props.editable === 'object'
    ? (props.editable.view === 'card' && isCardView.value) || (props.editable.view === 'row' && !isCardView.value)
    : !!props.editable
})

const rowDataArray = computed(() => {
  const rowArray = Array.isArray(props.row)
    ? props.row
    : [props.row]

  return rowArray.map((row: IItem) => {
    return {
      row,
      isSelectable: !selectionConfig.value?.disabled?.(row),
      rowKey: row[rowKey.value],
      columns: visibleColumns.value
        .map(col => {
          if (col.field === '_selectable' && isCardView.value) {
            return undefined
          }

          const colEditable = !(typeof col.noEdit === 'function' ? col.noEdit(row) : col.noEdit)
          const isEditable = isEditableRow.value && colEditable
          const cellValue = col.valueGetter(row)
          const cellFormattedValue = formatValue(cellValue, row, {
            format: col.format,
            dataType: col.dataType,
            comparator: col.comparator,
          })

          // Visuals - Styles
          // Cell
          const columnCellStyle = typeof col.cellStyle === 'function'
            ? col.cellStyle(row)
            : col.cellStyle

          const uiCellStyle = typeof props.ui?.cellStyle === 'function'
            ? props.ui?.cellStyle(row, col)
            : props.ui?.cellStyle

          // Cell inner
          const uiCellInnerStyle = typeof props.ui?.cellInnerStyle === 'function'
            ? props.ui?.cellInnerStyle(row, col)
            : props.ui?.cellInnerStyle

          // Visuals - Classes
          // Cell
          const columnCellClass = typeof col.cellClass === 'function'
            ? col.cellClass(row)
            : col.cellClass

          const uiCellClass = typeof props.ui?.cellClass === 'function'
            ? props.ui?.cellClass(row, col)
            : props.ui?.cellClass

          // Cell inner
          const uiCellInnerClass = typeof props.ui?.cellInnerClass === 'function'
            ? props.ui?.cellInnerClass(row, col)
            : props.ui?.cellInnerClass

          return {
            id: col.field,
            value: cellValue,
            valueFormatted: cellFormattedValue,
            column: col,
            isEditable,
            cellStyle: Object.assign({}, columnCellStyle, uiCellStyle, { '--colWidth': col.width }),
            cellInnerStyle: uiCellInnerStyle,
            cellClass: [columnCellClass, uiCellClass, { 'is-editable': isEditable }],
            cellInnerClass: uiCellInnerClass,
            link: {
              to: col.link?.(row) || undefined,
              ...col.linkProps,
            },
          }
        })
        .filter(Boolean) as IRowColumn[],
    }
  })
})

const rowClassArray = computed(() => {
  const rowArray = Array.isArray(props.row)
    ? props.row
    : [props.row]

  return rowArray.map((row, idx) => {
    const rowData = rowDataArray.value[idx]
    const isEven = props.index % 2

    return [
      typeof props.ui?.rowClass === 'function'
        ? props.ui?.rowClass(row)
        : props.ui?.rowClass,
      {
        'is-card': isCardView.value,
        'is-even': isEven,
        'is-editable': isEditableRow.value,
        'is-selectable': rowData?.isSelectable,
        [`${props.ui?.alternateRowClass}`]: isEven && !isCardView.value,
      },
    ]
  })
})

const rowStyleArray = computed(() => {
  const rowArray = Array.isArray(props.row)
    ? props.row
    : [props.row]

  return rowArray.map(row => [
    typeof props.ui?.rowStyle === 'function'
      ? props.ui?.rowStyle(row)
      : props.ui?.rowStyle,
  ])
})

function handleSelectToggle(row: IItem, ev?: MouseEvent) {
  const isCtrl = ev && !(ev.ctrlKey || ev.metaKey)

  tableSelectRow({
    row,
    selection,
    selectionConfig: selectionConfig.value,
    rowKey: rowKey.value,
    selectionByKey: selectionByKey.value,
    isSet: isCtrl,
  })
}

function handleEditCell(rowData: typeof rowDataArray.value[number], column: IRowColumn) {
  cellEdit.value = { row: rowData.row, column: column.column }
  tableStore.loadCellEditValue()
}

function handleCancelEditCell() {
  cellEdit.value = undefined
}

function handleEditCellMounted() {
  const el = tableEl.value?.querySelector('.active-edit-cell') as HTMLElement
  const controlEl = el?.querySelector('.control') as any

  if (controlEl) {
    controlEl.select?.() ?? controlEl.focus?.()
  }
}
</script>

<template>
  <DefineValueTemplate v-slot="{ column, row, isSelectable }">
    <Checkbox
      v-if="column.id === '_selectable'"
      :model-value="isSelected(row)"
      size="sm"
      :editable="isSelectable"
      @update:model-value="handleSelectToggle(row)"
    />

    <!-- Boolean -->
    <Checkbox
      v-if="column.column.dataType === 'boolean'"
      :model-value="column.value"
      size="sm"
      :label="column.valueFormatted"
      :editable="false"
      tabindex="-1"
      :visuals="{ checked: { checkbox: '!bg-primary !border-primary' } }"
    />

    <!-- Link -->
    <NuxtLink
      v-else-if="column.link?.to"
      v-bind="column.link"
      class="link"
      @click.stop.prevent
    >
      {{ column.valueFormatted }}
    </NuxtLink>

    <span
      v-else
      :style="column.cellInnerStyle"
      :class="column.cellInnerClass"
    >
      {{ column.valueFormatted }}
    </span>
  </DefineValueTemplate>

  <!-- Card view -->
  <div
    v-if="isCardView"
    class="tr-split"
    :style="{ '--cols': rowsColumnCount }"
  >
    <div
      v-for="(rowData, idx) in rowDataArray"
      :key="idx"
      v-bind="$attrs"
      class="tr tr--card"
      :class="[rowClassArray[idx], { 'is-selected': isSelected(rowData.row) }]"
      :style="rowStyleArray[idx]"
      @click="handleSelectToggle(rowData.row, $event)"
    >
      <div
        v-for="column in rowData.columns"
        :key="column.id"
        class="td"
        :style="column.cellStyle"
        :class="column.cellClass"
        :data-field="column.column.field"
        :data-key="rowData.rowKey"
      >
        <!-- Label -->
        <span class="td__label">
          {{ column.column.label }}
        </span>

        <!-- Value -->
        <div class="td__value">
          <!-- Edit button -->
          <Btn
            v-if="column.isEditable"
            size="xs"
            class="edit-btn"
            tabindex="-1"
            icon="i-material-symbols:edit-rounded"
            @click.stop.prevent="handleEditCell(rowData, column)"
          />

          <!-- Editing -->
          <template v-if="isEditingCell(rowData, column)">
            <Btn
              size="xs"
              class="edit-btn !flex"
              tabindex="-1"
              preset="CLOSE"
              no-dim
              @click.stop.prevent="handleCancelEditCell"
            />

            <Component
              :is="column.column._editComponent.component"
              v-model="cellEditValue"
              v-bind="column.column._editComponent.props"
              size="sm"
              class="active-edit-cell"
              grow
              @vue:mounted="handleEditCellMounted"
              @click.stop.prevent
            />

            <Btn
              size="xs"
              preset="SAVE"
            />
          </template>

          <!-- Value -->
          <slot
            v-else
            :name="column.column.field"
          >
            <ReuseValueTemplate
              :column
              :row="rowData.row"
              :is-selectable="rowData.isSelectable"
            />
          </slot>
        </div>
      </div>
    </div>
  </div>

  <!-- Regular view -->
  <div
    v-else-if="rowDataArray[0]"
    v-bind="$attrs"
    class="tr tr--row"
    :class="[rowClassArray[0], { 'is-selected': isSelected(rowDataArray[0].row) }]"
    :style="rowStyleArray[0]"
  >
    <div
      v-for="column in rowDataArray[0].columns"
      :key="column.id"
      class="td"
      :style="column.cellStyle"
      :class="column.cellClass"
      :data-field="column.column.field"
      :data-key="rowDataArray[0].rowKey"
    >
      <slot :name="column.column.field">
        <ReuseValueTemplate
          :column
          :row="rowDataArray[0].row"
          :is-selectable="rowDataArray[0].isSelectable"
        />
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tr {
  @apply flex;

  &-split {
    @apply grid w-full;

    grid-template-columns: repeat(var(--cols), 1fr);
  }

  .td {
    @apply flex items-center border-ca;
    @apply w-$colWidth;

    .link {
      @apply truncate;
    }
  }
}

.tr--card {
  @apply flex-col gap-y-2px rounded-custom p-2 m-1 dark:bg-black;
  @apply light:(outline-1 outline-ca outline-solid bg-white);

  &.is-selectable {
    @apply cursor-pointer;
  }

  &.is-selected {
    @apply outline-1 outline-primary outline-solid bg-primary/15;
  }

  &.is-editable {
    .td.is-editable:hover {
      @apply shadow-ca shadow-consistent-xs;

      .edit-btn {
        @apply flex;
      }
    }

    .edit-btn {
      @apply -translate-x-full top-1/2 left-0 -translate-y-1/2
        bg-white dark:bg-black;
      @apply hidden;

      position: absolute !important;
    }
  }

  .td {
    @apply grid w-full items-start rounded-custom min-h-6;

    grid-template-columns: 1fr 3fr;

    &__label {
      @apply text-caption text-xs min-h-6 p-t-1;
    }

    &__value {
      @apply relative flex items-center gap-1 leading-tight self-center;
    }
  }
}

.separator--vertical,
.separator--cell {
  .tr--row .td {
    @apply border-r-1;
  }
}

.separator--horizontal,
.separator--cell {
  .tr--row .td {
    @apply border-b-1;
  }
}

.table.is-bordered {
  .tr--row .td:first-child {
    @apply border-l-1;
  }

  .tr--row .td:last-child {
    @apply border-r-1;
  }
}
</style>

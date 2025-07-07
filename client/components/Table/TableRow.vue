<script setup lang="ts">
// NOTE: This is intentionally done in a single component to prevent spamming
// unnecessary creation of vue components for each cell and to keep consistency
// between card and regular views

import { NuxtLink } from '#components'

import { formatValue } from '$utils'

// Types
import type { ITableProps } from './types/table-props.type'
import type { IRowColumn } from './types/table-row-column.type'

// Functions
import { tableSelectRow } from './functions/table-select-row'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'ui' | 'editable' | 'to' | 'showCopyBtn'> & {
  row: any | any[]
  index: number
}

defineOptions({ inheritAttrs: false })
const props = defineProps<IProps>()

// Utils
const { currentLocaleCode } = useLocale()

// Helpers
function handleCopyBtnFormat(value: any) {
  try {
    return JSON.stringify(value)
  }
  catch {
    return value
  }
}

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
  emits,
  rowClickable,
} = storeToRefs(tableStore)

// Layout
const [DefineValueTemplate, ReuseValueTemplate] = createReusableTemplate<{
  column: IRowColumn
  row: any
  isSelectable: boolean
}>()

const RowComponent = computed(() => {
  return props.to ? NuxtLink : 'div'
})

const isEditableRow = computed(() => {
  return typeof props.editable === 'object'
    ? (props.editable.view === 'card' && isCardView.value) || (props.editable.view === 'row' && !isCardView.value)
    : !!props.editable
})

const rowDataArray = computed(() => {
  const rowArray = Array.isArray(props.row)
    ? props.row
    : [props.row]

  return rowArray.map((row: any) => {
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
            localeIso: currentLocaleCode.value,
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

function handleSaveCellEditValue() {
  tableStore.saveCellEditValue()
  cellEdit.value = undefined
}

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

  if (isCtrl) {
    ev.preventDefault()
    ev.stopPropagation()
  }
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

function handleRowClick(payload: { row: IItem, ev?: MouseEvent }) {
  if (rowClickable.value) {
    emits.value.rowClick(payload)
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
      :style="column.cellInnerStyle"
      :class="column.cellInnerClass"
      @click.stop
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
    :class="{ 'is-card-editing': !!cellEdit }"
    :style="{ '--cols': rowsColumnCount }"
  >
    <Component
      :is="RowComponent"
      v-for="(rowData, idx) in rowDataArray"
      :key="idx"
      v-bind="$attrs"
      class="tr tr--card"
      :class="[rowClassArray[idx], { 'is-selected': isSelected(rowData.row), 'is-clickable': rowClickable }]"
      :style="rowStyleArray[idx]"
      :to="to?.(rowData.row, { rowKey })"
      @click="[
        handleSelectToggle(rowData.row, $event),
        handleRowClick({ row: rowData.row, ev: $event }),
      ]"
    >
      <div
        v-for="column in rowData.columns"
        :key="column.id"
        class="td"
        :style="column.cellStyle"
        :class="[column.cellClass, { 'is-editing': isEditingCell(rowData, column) }]"
        :data-field="column.column.field"
        :data-key="rowData.rowKey"
      >
        <!-- Label -->
        <span class="td__label">
          {{ column.column._label }}

          <!-- Edit button -->
          <Btn
            v-if="column.isEditable"
            size="xs"
            class="edit-btn"
            tabindex="-1"
            icon="i-material-symbols:edit-rounded"
            @click.stop.prevent="handleEditCell(rowData, column)"
          />

          <!-- Cancel edit -->
          <Btn
            v-if="column.isEditable"
            size="xs"
            class="cancel-edit-btn"
            tabindex="-1"
            preset="CLOSE"
            no-dim
            @click.stop.prevent="handleCancelEditCell"
          />
        </span>

        <!-- Value -->
        <div class="td__value">
          <!-- Editing -->
          <template v-if="isEditingCell(rowData, column)">
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

            <!-- Save button -->
            <Btn
              size="xs"
              preset="SAVE"
              bg="white dark:black"
              @click.stop.prevent="handleSaveCellEditValue"
            />
          </template>

          <!-- Value -->
          <slot
            v-else
            :name="column.column.field"
            :row="rowData.row"
            :column="column.column"
            :value="column.value"
          >
            <ReuseValueTemplate
              :column
              :row="rowData.row"
              :is-selectable="rowData.isSelectable"
            />
          </slot>
        </div>
      </div>

      <!-- Used for absolutely position info/element -->
      <slot
        name="inner"
        mode="card"
        :row="rowData.row"
      />
    </Component>
  </div>

  <!-- Regular view -->
  <Component
    :is="RowComponent"
    v-else-if="rowDataArray[0]"
    v-bind="$attrs"
    class="tr tr--row"
    :class="[
      rowClassArray[0],
      { 'is-selected': isSelected(rowDataArray[0].row), 'is-clickable': rowClickable },
    ]"
    :style="rowStyleArray[0]"
    :to="to?.(rowDataArray[0].row, { rowKey })"
    @click="handleRowClick({ row: rowDataArray[0].row, ev: $event })"
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
      <slot
        :name="column.column.field"
        :row="rowDataArray[0].row"
        :column="column.column"
        :value="column.value"
      >
        <ReuseValueTemplate
          :column
          :row="rowDataArray[0].row"
          :is-selectable="rowDataArray[0].isSelectable"
        />
      </slot>

      <CopyBtn
        v-if="showCopyBtn && !column.column.noCopyBtn && !column.column.isHelperCol"
        size="sm"
        class="copy-btn"
        :model-value="column.valueFormatted"
        no-text
        :ripple="false"
        :transform="handleCopyBtnFormat"
        @click.stop.prevent
        @mousedown.stop.prevent
      />
    </div>

    <!-- Used for absolutely position info/element -->
    <slot
      name="inner"
      mode="row"
      :row="rowDataArray[0].row"
    />
  </Component>
</template>

<style scoped lang="scss">
.tr {
  @apply flex relative;

  &.is-clickable {
    &:hover {
      @apply cursor-pointer;
    }
  }

  &-split {
    @apply grid w-full;

    grid-template-columns: repeat(var(--cols), 1fr);
  }

  .td {
    @apply relative flex items-center border-ca;
    @apply w-$colWidth;

    .link {
      @apply truncate font-rem-13;
    }
  }
}

.tr--card {
  @apply flex-col gap-y-2px rounded-custom p-2 m-1 dark:bg-black overflow-auto;
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

    .edit-btn,
    .cancel-edit-btn {
      @apply top-1/2 right-0 -translate-y-1/2
        bg-white dark:bg-black;
      @apply hidden;

      position: absolute !important;
    }
  }

  .is-editing {
    .cancel-edit-btn {
      @apply flex;
    }
  }

  .td {
    @apply grid w-full items-start rounded-custom min-h-6;

    grid-template-columns: 1fr 3fr;

    &__label {
      @apply relative text-caption text-xs min-h-6 p-t-1 line-clamp-2 h-full;
    }

    &__value {
      @apply flex items-center gap-1 leading-tight self-center overflow-auto p-x-2;
    }
  }

  .is-card-editing.is-editable .td__label {
    @apply color-black dark:color-white;
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

.td:hover {
  .copy-btn {
    @apply flex;
  }
}

.copy-btn {
  @apply absolute right-2 top-2 hidden;
}
</style>

<script setup lang="ts">
// NOTE: This is intentionally done in a single component to prevent spamming
// unnecessary creation of vue components for each cell and to keep consistency
// between card and regular views

import { NuxtLink } from '#components'

// Types
import type { ITableProps } from './types/table-props.type'
import type { IRowColumn } from './types/table-row-column.type'

// Models
import type { TableColumn } from './models/table-column.model'

// Functions
import { tableSelectRow } from './functions/table-select-row'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'ui' | 'editable' | 'to' | 'showCopyBtn' | 'toLinkProps'> & {
  row: any | any[]
  index: number
  isVisibleByColumnField: Record<string, boolean>
  visibleColumns: TableColumn[]
}

defineOptions({ inheritAttrs: false })
const props = defineProps<IProps>()

// Utils
const { currentLocaleCode } = useLocale()

// Helpers
function handleCopyBtnFormat(value: any) {
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    }
    catch {
      return value
    }
  } else {
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
  rowsColumnCount,
  isCardView,
  cellEdit,
  isEditingCell: isEditingCellStore,
  cellEditValue,
  emits,
  rowClickable,
} = tableStore

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
      columns: props.visibleColumns
        .map(col => {
          if (col.field === '_selectable' && isCardView.value) {
            return undefined
          }

          const colEditable = !col.isHelperCol && !(typeof col.noEdit === 'function' ? col.noEdit(row) : col.noEdit)
          const isEditable = isEditableRow.value && colEditable

          const cellValue = col.valueGetter(row)
          const cellFormattedValue = formatValue(cellValue, row, {
            format: col.format,
            dataType: col.dataType,
            comparator: col.comparator,
            localeIso: currentLocaleCode.value,
            source: { type: 'component', name: 'TableRow' },
          })

          let displayComponent: any
          if (col.displayComponent) {
            displayComponent = {
              component: markRaw(col.displayComponent.component),
              props: typeof col.displayComponent.props === 'function'
                ? col.displayComponent.props({ row, column: col })
                : col.displayComponent.props,
            }
          }

          // Visuals - Styles
          // Cell
          const columnCellStyle = typeof col.cellStyle === 'function'
            ? col.cellStyle(row)
            : col.cellStyle

          const uiCellStyle = props.ui?.cellStyle?.({
            row,
            column: col,
          })

          // Cell inner
          const uiCellInnerStyle = props.ui?.cellInnerStyle?.({
            row,
            column: col,
          })

          // Visuals - Classes
          // Cell
          const columnCellClass = typeof col.cellClass === 'function'
            ? col.cellClass(row)
            : col.cellClass

          const uiCellClass = props.ui?.cellClass?.({
            row,
            column: col,
            defaults: TABLE_DEFAULT_PROPS.ui.cellClass(),
          })

          // Cell inner
          const uiCellInnerClass = props.ui?.cellInnerClass?.({
            row,
            column: col,
            defaults: TABLE_DEFAULT_PROPS.ui.cellInnerClass(),
          })

          return {
            id: col.field,
            value: cellValue,
            displayComponent,
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

  const alternateRowClass = props.ui?.alternateRowClass?.({
    defaults: TABLE_DEFAULT_PROPS.ui.alternateRowClass(),
  })

  return rowArray.map((row, idx) => {
    const rowData = rowDataArray.value[idx]
    const isEven = props.index % 2

    return [
      typeof props.ui?.rowClass === 'function'
        ? props.ui?.rowClass({
            row,
            defaults: TABLE_DEFAULT_PROPS.ui.rowClass(),
          })
        : undefined,
      {
        'is-card': isCardView.value,
        'is-even': isEven,
        'is-editable': isEditableRow.value,
        'is-selectable': rowData?.isSelectable,
        [alternateRowClass ?? '']: !!alternateRowClass && isEven && !isCardView.value,
      },
    ]
  })
})

const rowStyleArray = computed(() => {
  const rowArray = Array.isArray(props.row)
    ? props.row
    : [props.row]

  return rowArray.map(row => [
    props.ui?.rowStyle?.({ row }),
  ])
})

function handleSaveCellEditValue() {
  tableStore.saveCellEditValue()
  cellEdit.value = undefined
}

function handleSelectToggle(row: IItem, ev?: MouseEvent) {
  const isCtrl = ev && !(ev.ctrlKey || ev.metaKey)
  const isLink = ev && ev.target instanceof HTMLAnchorElement

  if (isLink) {
    ev.stopPropagation()

    return
  }

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

function handleEditCell(
  rowData: typeof rowDataArray.value[number],
  column: IRowColumn,
) {
  if (!column.isEditable) {
    return
  }

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

function getEditComponentProps(row: IItem, column: IRowColumn) {
  return typeof column.column._editComponent.props === 'function'
    ? column.column._editComponent.props({ row, column: column.column })
    : column.column._editComponent.props
}
</script>

<template>
  <DefineValueTemplate v-slot="{ column, row: slotRow, isSelectable }">
    <Component
      :is="column.displayComponent?.component"
      v-if="column.displayComponent"
      v-bind="column.displayComponent?.props"
    />

    <Checkbox
      v-else-if="column.id === '_selectable'"
      :model-value="isSelected(slotRow)"
      size="sm"
      :readonly="!isSelectable"
      no-hover-effect
      :ui="{ labelClass: ({ defaults }) => `${defaults.all} font-rem-13` }"
      @update:model-value="handleSelectToggle(slotRow)"
    />

    <!-- Boolean -->
    <Checkbox
      v-else-if="column.column.dataType === 'boolean'"
      :model-value="column.value"
      size="sm"
      :label="column.valueFormatted"
      readonly
      tabindex="-1"
      no-hover-effect
      :ui="{
        labelClass: ({ defaults }) => `${defaults.all} font-rem-13`,
        checkboxClass: ({ defaults }) => `${defaults.all} !border-primary !border-solid`,
      }"
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
      v-bind="{ ...$attrs, ...toLinkProps }"
      class="tr"
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
              v-bind="getEditComponentProps(rowData.row, column)"
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
    v-bind="{ ...$attrs, ...toLinkProps }"
    class="tr is-row"
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
      @click="handleEditCell(rowDataArray[0], column)"
    >
      <!-- <div
        v-if="!isVisibleByColumnField[column.column.field]"
        class="td__placeholder"
      /> -->

      <!-- Editing -->
      <template v-if="isEditingCell(rowDataArray[0], column)">
        <Component
          :is="column.column._editComponent.component"
          v-model="cellEditValue"
          v-bind="getEditComponentProps(rowDataArray[0].row, column)"
          size="sm"
          class="active-edit-cell"
          grow
          @vue:mounted="handleEditCellMounted"
          @click.stop.prevent
        />
      </template>

      <slot
        v-else
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
        :transform="handleCopyBtnFormat"
        @click.stop.prevent
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
  &-split {
    @apply grid w-full;

    grid-template-columns: repeat(var(--cols), 1fr);
  }
}
</style>

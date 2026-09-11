<script setup lang="ts">
// NOTE: This is intentionally done in a single component to prevent spamming
// unnecessary creation of vue components for each cell and to keep consistency
// between card and regular views

import { Checkbox, NuxtLink } from '#components'

// Types
import type { ITableProps } from './types/table-props.type'
import type { IRowColumn } from './types/table-row-column.type'

// Models
import type { TableColumn } from './models/table-column.model'

// Functions
import { tableSelectRow } from './functions/table-select-row'
import { tableIsCellEditable } from './functions/table-is-cell-editable'
import { isTableBooleanCheckbox } from './functions/table-toggle-boolean-cell'

// Composables
import { useTableRowEditing } from './composables/useTableRowEditing'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'ui' | 'editable' | 'freeze' | 'to' | 'showCopyBtn' | 'toLinkProps'> & {
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
    } catch {
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

// Store
const tableStore = useTableStore()
const {
  rowKey,
  selection,
  selectionByKey,
  selectionConfig,
  rowsColumnCount,
  isCardView,
  cellEdit,
  getCellEdit,
  updateCellEditValue,
  isEditingRow,
  emits,
  rowClickable,
} = tableStore

const {
  isEditableRow,
  isFullRowEdit,
  isSelectedCell,
  handleEditRow,
  handleRowEditKeydown,
  handleSelectCell,
  handleEditCell,
  handleSaveCellEditValue,
  handleCancelEditCell,
  handleEditCellMounted,
  handleToggleBoolean,
} = useTableRowEditing(tableStore, toRef(props, 'editable'))

// Layout
const [DefineValueTemplate, ReuseValueTemplate] = createReusableTemplate<{
  column: IRowColumn
  row: any
  isSelectable: boolean
}>()

const RowComponent = computed(() => {
  return props.to ? NuxtLink : 'div'
})

const [DefineRowActions, ReuseRowActions] = createReusableTemplate<{
  actions: ReturnType<typeof getRowActions>
}>()

function handleRowActionsClick(ev: MouseEvent) {
  if (ev.target instanceof Element && ev.currentTarget instanceof Node
    && ev.target.closest('a[href]')?.contains(ev.currentTarget)) {
    ev.preventDefault()
  }
}

function getRowActionsClass(row: IItem) {
  const defaults = TABLE_DEFAULT_PROPS.ui.rowActionsClass()
  return props.ui?.rowActionsClass?.({ row, defaults }) ?? defaults.all
}

function getRowActions(rowData: typeof rowDataArray.value[number]) {
  const isEditing = isEditingRow(rowData.row)
  
  return {
    row: rowData.row,
    mode: isCardView.value ? 'card' as const : 'row' as const,
    isEditing,
    isModified: isEditing && tableStore.isCellEditModified.value,
    canEdit: isFullRowEdit.value && tableStore.visibleColumns.value.some(column => tableIsCellEditable(rowData.row, column)),
    disabled: cellEdit.value.length > 0 && !isEditing,
    edit: () => handleEditRow(rowData),
    save: () => {
      if (isEditingRow(rowData.row)) {
        handleSaveCellEditValue()
      }
    },
    cancel: () => {
      if (isEditingRow(rowData.row)) {
        handleCancelEditCell()
      }
    },
  }
}

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

          const isEditable = isEditableRow.value && tableIsCellEditable(row, col)

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
      },
      ...(alternateRowClass && isEven && !isCardView.value ? [alternateRowClass] : []),
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
      :readonly="isFullRowEdit || !column.isEditable || !isTableBooleanCheckbox(column.column)"
      tabindex="-1"
      :no-hover-effect="isFullRowEdit || !column.isEditable || !isTableBooleanCheckbox(column.column)"
      :ui="{
        labelClass: ({ defaults }) => `${defaults.all} font-rem-13`,
        checkboxClass: ({ defaults }) => `${defaults.all} !border-primary !border-solid`,
      }"
      @update:model-value="handleToggleBoolean(slotRow, column)"
      @dblclick.stop
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

  <DefineRowActions v-slot="{ actions }">
    <div
      v-if="$slots['row-actions'] || actions.canEdit || (!isCardView && isFullRowEdit)"
      class="row-actions"
      :class="[getRowActionsClass(actions.row), isCardView ? 'card-row-actions' : 'desktop-row-actions', { 'is-frozen': !isCardView && freeze?.rowActions }]"
      @click.capture="handleRowActionsClick"
      @click.stop
      @dblclick.stop
    >
      <slot name="row-actions" v-bind="actions">
        <template v-if="actions.isEditing">
          <Btn
            size="sm"
            class="row-cancel-btn"
            preset="CLOSE"
            icon="i-material-symbols:close-rounded"
            :name="$t('general.cancel')"
            :title="$t('general.cancel')"
            no-uppercase
            no-bold
            @click.stop.prevent="handleCancelEditCell"
          />

          <Btn
            size="sm"
            class="row-save-btn"
            preset="SAVE"
            icon="i-material-symbols:check-rounded"
            :name="$t('general.save')"
            :title="$t('general.save')"
            no-uppercase
            @click.stop.prevent="handleSaveCellEditValue"
          />
        </template>
        <Btn
          v-else-if="actions.canEdit"
          size="sm"
          class="row-edit-btn"
          :data-key="actions.row[rowKey]"
          icon="i-material-symbols:edit-rounded"
          :name="$t('general.edit')"
          :title="$t('general.edit')"
          :disabled="actions.disabled"
          no-uppercase
          no-bold
          @click.stop.prevent="actions.edit"
        />
      </slot>
    </div>
  </DefineRowActions>

  <!-- Card view -->
  <div
    v-if="isCardView"
    class="tr-split"
    :class="{ 'is-card-editing': cellEdit.length > 0 }"
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
      @keydown="handleRowEditKeydown(rowData.row, $event)"
      @click="[
        handleSelectToggle(rowData.row, $event),
        handleRowClick({ row: rowData.row, ev: $event }),
      ]"
    >
      <ReuseRowActions :actions="getRowActions(rowData)" />
      <div
        v-for="column in rowData.columns"
        :key="column.id"
        class="td"
        :style="column.cellStyle"
        :class="[
          column.cellClass,
          {
            'is-editing': !!getCellEdit(rowData.row, column.column.field),
          },
        ]"
        :data-field="column.column.field"
        :data-key="rowData.rowKey"
      >
        <!-- Label -->
        <span class="td-label">
          {{ column.column._label }}

          <!-- Edit button -->
          <Btn
            v-if="column.isEditable && !isFullRowEdit"
            size="xs"
            class="edit-btn"
            icon="i-material-symbols:edit-rounded"
            @click.stop.prevent="handleEditCell(rowData, column)"
          />

          <!-- Cancel edit -->
          <Btn
            v-if="column.isEditable && !isFullRowEdit"
            size="xs"
            class="cancel-edit-btn"
            preset="CLOSE"
            no-dim
            @click.stop.prevent="handleCancelEditCell"
          />
        </span>

        <!-- Value -->
        <div class="td-value">
          <!-- Editing -->
          <template v-if="!!getCellEdit(rowData.row, column.column.field)">
            <Component
              :is="column.column._editComponent.component"
              :model-value="getCellEdit(rowData.row, column.column.field)?.value"
              v-bind="getEditComponentProps(rowData.row, column)"
              size="sm"
              class="active-edit-cell"
              :no-border="false"
              grow
              @update:model-value="updateCellEditValue(rowData.row, column.column.field, $event)"
              @vue:mounted="handleEditCellMounted(rowData.row, column)"
              @click.stop
            />

            <!-- Save button -->
            <Btn
              v-if="!isFullRowEdit"
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
    @keydown="handleRowEditKeydown(rowDataArray[0].row, $event)"
  >
    <div
      v-for="column in rowDataArray[0].columns"
      :key="column.id"
      class="td"
      :style="column.cellStyle"
      :class="[
        column.cellClass,
        {
          'is-cell-selected': isSelectedCell(rowDataArray[0].row, column),
          'is-frozen': column.column.semiFrozen,
          'is-frozen-edge': column.column.frozen,
        },
      ]"
      :tabindex="column.isEditable ? -1 : undefined"
      :data-field="column.column.field"
      :data-key="rowDataArray[0].rowKey"
      @click="handleSelectCell(rowDataArray[0], column, $event)"
      @dblclick="handleEditCell(rowDataArray[0], column, $event)"
    >
      <!-- Editing -->
      <template v-if="!!getCellEdit(rowDataArray[0].row, column.column.field)">
        <Component
          :is="column.column._editComponent.component"
          :model-value="getCellEdit(rowDataArray[0].row, column.column.field)?.value"
          v-bind="getEditComponentProps(rowDataArray[0].row, column)"
          size="sm"
          class="active-edit-cell"
          no-border
          grow
          @update:model-value="updateCellEditValue(rowDataArray[0].row, column.column.field, $event)"
          @vue:mounted="handleEditCellMounted(rowDataArray[0].row, column)"
          @click.stop
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

      <Btn
        v-if="column.isEditable && !isFullRowEdit && !isTableBooleanCheckbox(column.column)
          && !getCellEdit(rowDataArray[0].row, column.column.field)"
        size="xs"
        class="cell-edit-btn"
        icon="i-material-symbols:edit-rounded"
        :name="`${$t('general.edit')} ${column.column._label}`"
        :title="$t('general.edit')"
        tabindex="-1"
        @click.stop.prevent="handleEditCell(rowDataArray[0], column)"
        @dblclick.stop.prevent
      />

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

    <ReuseRowActions :actions="getRowActions(rowDataArray[0])" />

    <!-- Used for absolutely position info/element -->
    <slot
      name="inner"
      mode="row"
      :row="rowDataArray[0].row"
    />
  </Component>
</template>

<style scoped lang="scss">
@use './styles/frozen-edge-shadow' as *;

.can-scroll-right .desktop-row-actions.is-frozen {
  border-left-width: 1px;
  @include frozen-edge-shadow(-1);
}

.can-scroll-left .is-row .td.is-frozen-edge {
  border-right-width: 1px;
  @include frozen-edge-shadow(1);
}

.desktop-row-actions {
  flex: 0 0 var(--table-row-actions-width, 5.25rem);
  min-width: 0;
  margin-left: auto;

  &.is-frozen {
    position: sticky;
    right: 0;
    z-index: 1;
  }
}

:where(.is-row .td.is-frozen) {
  background-color: inherit;
}

.separator--vertical .desktop-row-actions,
.separator--cell .desktop-row-actions,
.is-bordered .desktop-row-actions {
  border-right-width: 1px;
}

.separator--horizontal .desktop-row-actions,
.separator--cell .desktop-row-actions {
  border-bottom-width: 1px;
}

.is-row .active-edit-cell {
  --padding: 0 !important;
  --margin: 0 !important;

  :deep(.input-wrapper-border) {
    background-color: transparent;
  }
}

.is-row .is-cell-selected {
  @apply outline-2 outline-primary outline-offset--2;
  outline-style: solid;
}

.is-row .td:has(> .cell-edit-btn) {
  padding-right: 2rem;
}

.is-row .td:has(> .cell-edit-btn + .copy-btn) {
  padding-right: 4.25rem;
}

.is-row .cell-edit-btn {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  opacity: 0.5;
}

.is-row .td:hover > .cell-edit-btn,
.is-row .td:focus-within > .cell-edit-btn {
  display: flex;
}

.is-row .cell-edit-btn + .copy-btn {
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

.tr {
  &-split {
    @apply grid w-full;

    grid-template-columns: repeat(var(--cols), 1fr);
  }
}
</style>

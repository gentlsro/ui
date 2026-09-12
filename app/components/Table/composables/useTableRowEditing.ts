import type { useTableStore } from '../stores/table.store'
import type { ITableProps } from '../types/table-props.type'
import type { IRowColumn } from '../types/table-row-column.type'

// Functions
import { tableIsEditorPopupOpen } from '../functions/table-is-editor-popup-open'
import { isTableBooleanCheckbox, tableToggleBooleanCell } from '../functions/table-toggle-boolean-cell'

export function useTableRowEditing(tableStore: ReturnType<typeof useTableStore>, editable: Ref<ITableProps['editable']>) {
  const { 
    tableEl,
    rowKey,
    isCardView,
    selectedCell,
    cellEdit,
    isEditingRow,
   } = tableStore

  const isEditableRow = computed(() => {
    return isObject(editable.value)
      ? !editable.value.view 
       || (editable.value.view === 'card' && isCardView.value) // Card view
       || (editable.value.view === 'row' && !isCardView.value) // Desktop view
      : !!editable.value
  })

  const isFullRowEdit = computed(() => {
    if (cellEdit.value.length) {
      return tableStore.cellEditMode.value === 'row'
    }

    return isEditableRow.value
      && (isObject(editable.value) && editable.value.mode
        ? editable.value.mode === 'row'
        : isCardView.value)
  })

  function handleEditRow(rowData: { row: IItem }) {
    if (!isFullRowEdit.value) {
      return
    }

    tableStore.startRowEdit(rowData.row, tableStore.visibleColumns.value)
  }

  function handleRowEditKeydown(row: IItem, ev: KeyboardEvent) {
    if (!isFullRowEdit.value || !isEditingRow(row) || ev.defaultPrevented || ev.isComposing) {
      return
    }

    const target = ev.target
    if (target instanceof Element && tableIsEditorPopupOpen(target)) {
      return
    }

    if (ev.key === 'Escape') {
      handleCancelEditCell()
    } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
      handleSaveCellEditValue()
    } else {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }

  function isSelectedCell(row: IItem, column: IRowColumn) {
    return selectedCell.value?.rowKey === row[rowKey.value]
      && selectedCell.value?.field === column.column.field
  }

  function isCellControlEvent(ev?: MouseEvent) {
    if (!ev || !(ev.target instanceof Element) || !(ev.currentTarget instanceof Element)) {
      return false
    }

    const control = ev.target.closest('a, button, input, textarea, select, [contenteditable="true"]')

    return !!control && ev.currentTarget.contains(control)
  }

  function handleSelectCell(
    rowData: { row: IItem },
    column: IRowColumn,
    ev?: MouseEvent,
  ) {
    if (isFullRowEdit.value || !column.isEditable || isCellControlEvent(ev)) {
      return
    }

    if (cellEdit.value.length && !tableStore.getCellEdit(rowData.row, column.column.field)) {
      tableStore.finishCellEdit()
    }

    selectedCell.value = {
      rowKey: rowData.row[rowKey.value],
      field: column.column.field,
    }

    ev?.preventDefault()
    ev?.stopPropagation()
  }

  function handleEditCell(
    rowData: { row: IItem },
    column: IRowColumn,
    e?: MouseEvent,
  ) {
    if (isFullRowEdit.value || !column.isEditable || tableStore.getCellEdit(rowData.row, column.column.field)
      || isCellControlEvent(e)) {
      return
    }

    e?.preventDefault()
    e?.stopPropagation()

    if (isTableBooleanCheckbox(column.column)) {
      handleToggleBoolean(rowData.row, column)
      return
    }

    if (isCardView.value) {
      if (cellEdit.value.length) {
        tableStore.saveCellEditValue()
      }
    } else {
      handleSelectCell(rowData, column)
    }

    tableStore.startCellEdit(rowData.row, column.column)
  }

  function handleSaveCellEditValue() {
    const editedRow = isFullRowEdit.value ? cellEdit.value[0]?.row : undefined
    tableStore.finishCellEdit()
    restoreRowFocus(editedRow)
  }

  function handleCancelEditCell() {
    const editedRow = isFullRowEdit.value ? cellEdit.value[0]?.row : undefined
    tableStore.cancelCellEdit()
    restoreRowFocus(editedRow)
  }

  function restoreRowFocus(editedRow?: IItem) {
    if (editedRow) {
      void nextTick(() => {
        Array.from(tableEl.value?.querySelectorAll<HTMLElement>('.row-edit-btn[data-key]') ?? [])
          .find(el => el.dataset.key === String(editedRow[rowKey.value]))
          ?.focus({ preventScroll: true })
      })
    }
  }

  function handleEditCellMounted(row: IItem, column: IRowColumn) {
    const first = cellEdit.value[0]
    if (first?.row !== row || first.column.field !== column.column.field) {
      return
    }

    const cell = Array.from(tableEl.value?.querySelectorAll<HTMLElement>('.td[data-key][data-field]') ?? [])
      .find(el => el.dataset.key === String(row[rowKey.value]) && el.dataset.field === column.column.field)
    const el = cell?.querySelector<HTMLElement>('.active-edit-cell')
    const controlEl = el?.querySelector<HTMLElement>('.control')
    const focusEl = controlEl ?? (el?.matches('[tabindex]') ? el : el?.querySelector<HTMLElement>('[tabindex]:not([tabindex="-1"])'))

    focusEl?.focus({ preventScroll: true })

    if ((controlEl instanceof HTMLInputElement || controlEl instanceof HTMLTextAreaElement)
      && ['text', 'search', 'tel', 'url', 'password', 'textarea'].includes(controlEl.type)) {
      controlEl.setSelectionRange(controlEl.value.length, controlEl.value.length)
    }
  }

  function handleToggleBoolean(row: IItem, column: IRowColumn) {
    if (!isFullRowEdit.value && column.isEditable && isTableBooleanCheckbox(column.column)) {
      tableToggleBooleanCell(tableStore, row, column.column)
    }
  }

  return {
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
  }
}

import type { TableColumn } from '../models/table-column.model'
import type { useTableStore } from '../stores/table.store'

import { tableIsCellEditable } from './table-is-cell-editable'

export function tableToggleBooleanCell(store: ReturnType<typeof useTableStore>, row: IItem, column: TableColumn) {
  if (!tableIsCellEditable(row, column) || (store.cellEdit.value.length && store.cellEditMode.value === 'row')) {
    return
  }

  if (store.cellEdit.value.length) {
    store.saveCellEditValue()
  }

  if (!store.isCardView.value) {
    store.selectedCell.value = { 
      rowKey: row[store.rowKey.value],
      field: column.field,
    }
  }

  store.startCellEdit(row, column)
  const edit = store.cellEdit.value[0]

  if (!edit) {
    return
  }

  edit.value = edit.value !== true
  store.saveCellEditValue()
  store.cancelCellEdit()
}

export function isTableBooleanCheckbox(column: TableColumn) {
  return column.dataType === 'boolean' && !column.editComponent
}

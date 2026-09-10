import type { TableColumn } from '../models/table-column.model'
import type { useTableStore } from '../stores/table.store'

import { tableIsCellEditable } from './table-is-cell-editable'

export function tableToggleBooleanCell(store: ReturnType<typeof useTableStore>, row: IItem, column: TableColumn) {
  if (!tableIsCellEditable(row, column)) {
    return
  }

  if (store.cellEdit.value) {
    store.saveCellEditValue()
  }

  store.selectedCell.value = { 
    rowKey: row[store.rowKey.value],
    field: column.field
  }
  
  store.cellEdit.value = { row, column }

  store.loadCellEditValue()
  store.cellEditValue.value = store.cellEditValue.value !== true
  store.saveCellEditValue()
  store.cellEdit.value = undefined
}

export function isTableBooleanCheckbox(column: TableColumn) {
  return column.dataType === 'boolean' && !column.editComponent
}

import type { TableColumn } from '../models/table-column.model'
import type { useTableStore } from '../stores/table.store'

export function tableToggleBooleanCell(store: ReturnType<typeof useTableStore>, row: IItem, column: TableColumn) {
  const noEdit = column.noEdit ?? false

  if (column.isHelperCol || noEdit === true || (noEdit !== false && noEdit(row))) {
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
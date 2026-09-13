import type { TableColumn } from '../models/table-column.model'

export function tableIsCellEditable(row: IItem, column: Pick<TableColumn, 'isHelperCol' | 'noEdit'>) {
  return !column.isHelperCol
    && !(typeof column.noEdit === 'function' ? column.noEdit(row) : column.noEdit)
}

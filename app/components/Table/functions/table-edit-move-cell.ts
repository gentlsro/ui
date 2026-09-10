import type { TableColumn } from '../models/table-column.model'
import { tableIsCellEditable } from './table-is-cell-editable'

// Use data indices so navigation works beyond the rendered cells.
export function tableEditMoveCell(payload: {
  rows: IItem[]
  columns: Pick<TableColumn, 'field' | 'isHelperCol' | 'noEdit'>[]
  rowIndex: number
  columnIndex: number
  key: string
  shiftKey?: boolean
  isCardView: boolean
}) {
  const { rows, columns, key, shiftKey, isCardView } = payload
  let { rowIndex, columnIndex } = payload

  const step = shiftKey ? -1 : 1
  const sequential = key === 'Tab'
  let rowStep = 0
  let columnStep = 0

  if (sequential) {
    columnStep = step
  } else if (key === 'Enter' || key === 'ArrowUp' || key === 'ArrowDown') {
    const direction = key === 'Enter' ? step : key === 'ArrowUp' ? -1 : 1

    if (isCardView) {
      columnStep = direction
    } else {
      rowStep = direction
    }
  } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const direction = key === 'ArrowLeft' ? -1 : 1

    if (isCardView) {
      rowStep = direction
    } else {
      columnStep = direction
    }
  } else {
    return
  }

  if (rowIndex < 0 || columnIndex < 0 || !columns.length) {
    return
  }

  while (true) {
    rowIndex += rowStep
    columnIndex += columnStep

    if (sequential && (columnIndex < 0 || columnIndex >= columns.length)) {
      rowIndex += step
      columnIndex = step > 0 ? 0 : columns.length - 1
    }

    if (rowIndex < 0 || rowIndex >= rows.length || columnIndex < 0 || columnIndex >= columns.length) {
      return
    }

    const row = rows[rowIndex]!
    const column = columns[columnIndex]!
    if (tableIsCellEditable(row, column)) {
      return { row, column, rowIndex, columnIndex }
    }
  }
}

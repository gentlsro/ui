// Types
import type { IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'

// Models
import type { PivotColumn } from '../models/pivot-column.model'

export function isValueHeaderCellCollapsible(payload: {
  columns: PivotColumn[]
  cell: Pick<IPivotValueHeaderCell, 'columnFieldIndex' | 'groupId'>
}) {
  const { columns, cell } = payload

  if (!cell.groupId || cell.columnFieldIndex === undefined) {
    return false
  }

  const lastColumnFieldIndex = Math.max(columns.length - 1, 0)

  return cell.columnFieldIndex < lastColumnFieldIndex
}

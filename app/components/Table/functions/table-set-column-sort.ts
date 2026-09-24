// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Sets (or clears) a column's sort while keeping the multi-sort order intact:
 * a newly sorted column goes last, a cleared one closes the gap it leaves
 */
export function tableSetColumnSort(
  columns: TableColumn[],
  column: TableColumn,
  sort?: 'asc' | 'desc',
) {
  column.sort = sort

  if (!sort) {
    const sortOrder = column.sortOrder

    if (sortOrder !== undefined) {
      columns.forEach(col => {
        if (col.sortOrder !== undefined && col.sortOrder > sortOrder) {
          col.sortOrder -= 1
        }
      })
    }

    column.sortOrder = undefined
  } else if (!column.sortOrder) {
    column.sortOrder = columns.filter(col => col.sortOrder !== undefined).length + 1
  }
}

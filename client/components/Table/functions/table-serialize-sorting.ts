// Types
import type { ITableSortItem } from '../types/table-sort-item.type'

// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Serializes the sorting from the internal structure to the URL
 *
 * You can provide either `columns` or `sortItems`
 */
export function tableSerializeSorting(payload: {
  columns?: TableColumn[]
  sortItems?: ITableSortItem[]
  lastRow?: IItem
}): string {
  const { columns = [], sortItems } = payload

  const _sortItems = sortItems ?? columns
    .flatMap(col => col.sortDbQuery)
    .filter(Boolean)
    .toSorted((a, b) => (a!.sortOrder || 0) - (b!.sortOrder || 0))

  return _sortItems
    .map(sortItem => `${sortItem?.field}.${sortItem?.direction}`)
    .join(',')
}

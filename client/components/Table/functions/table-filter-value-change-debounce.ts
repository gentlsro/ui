// Types
import type { ITableFilterItem } from '../types/table-filter-item.type'

// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * When modifying value of a column filter, we might want to debounce the change
 * to avoid too many requests to the server
 */
export function tableFilterValueChangeDebounce(payload: {
  column: TableColumn
  filter: ITableFilterItem
}) {
  const { column, filter } = payload

  const _isEmpty = Array.isArray(filter.value) ? isEmpty(filter.value) : isNil(filter.value)

  if (_isEmpty) {
    return 0
  }

  switch (filter.dataType) {
    case 'string':
    case 'stringSimple':
    case 'number':
    case 'numberSimple':
    case 'currency':
    case 'currencySimple':
    case 'duration':
    case 'durationSimple':
      return 500

    default:
      return 0
  }
}

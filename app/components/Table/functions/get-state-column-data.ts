// Models
import type { TableColumn } from '../models/table-column.model'

export function getStateColumnData(column: TableColumn) {
  const colProps = pick(column, ['field', 'frozen', 'hidden', 'semiFrozen', 'sort', 'sortOrder', 'width', '_internalSort'])
  const colFilters = column.filters?.map(f => pick(f, ['comparator', 'dataType', 'field', 'filterField', 'id', 'nonInteractive', 'value']))

  return { ...colProps, filters: colFilters }
}

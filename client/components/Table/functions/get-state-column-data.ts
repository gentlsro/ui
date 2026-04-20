// Models
import type { TableColumn } from '../models/table-column.model'
import type { ITableStateColumn } from '../types/table-state-column.type'

export function getStateColumnData(column: TableColumn): ITableStateColumn {
  const colProps = pick(column, ['field', 'frozen', 'hidden', 'semiFrozen', 'sort', 'sortOrder', 'width', '_internalSort'])
  const colFilters = column.filters?.map(f => pick(f, ['comparator', 'dataType', 'field', 'filterField', 'id', 'nonInteractive', 'value']))

  return { ...colProps, filters: colFilters }
}

// Types
import type { ITableProps } from '../types/table-props.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableSerializeFilters } from './table-serialize-filters'
import { tableSerializeSorting } from './table-serialize-sorting'
import { tableSerializeSelect } from './table-serialize-select'

export function tableSerializeData(payload: {
  columns: TableColumn[]
  queryBuilder: IQueryBuilderRow[]
  modifiers: ITableProps['modifiers']
}) {
  const { columns, queryBuilder, modifiers } = payload
  const {
    serializeFilters = tableSerializeFilters,
    serializeSorting = tableSerializeSorting,
    serializeSelectedColumns = tableSerializeSelect,
  } = modifiers ?? {}

  const filters = columns.flatMap(col => col.filterDbQuery)

  const filtersSerialized = serializeFilters(filters)
  const queryBuilderSerialized = serializeFilters(queryBuilder)
  const sortingSerialized = serializeSorting({ columns })
  const selectSerialized = serializeSelectedColumns({ columns })

  return {
    filters: filtersSerialized,
    queryBuilder: queryBuilderSerialized,
    sorting: sortingSerialized,
    select: selectSerialized,
  }
}

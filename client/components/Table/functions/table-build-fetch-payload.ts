// Types
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

export function tableBuildFetchPayload(payload: {
  columns: TableColumn[]
  queryBuilder: IQueryBuilderRow[]
  search: string
  pagination: { skip: number, take: number }
  fetchMore?: { lastRow: IItem, hasMore: boolean }
  queryParams?: URLSearchParams
  getStore: () => any
}) {
  const {
    columns,
    fetchMore,
    queryBuilder,
    search,
    pagination,
    queryParams,
    getStore,
  } = payload

  const columnFilters = columns.flatMap(col => col.filterDbQuery)

  return {
    tableData: {
      columns,
      queryBuilder,
      search,
      pagination,
      columnFilters,
    },
    queryParams,
    fetchMore,
    getStore,
  }
}

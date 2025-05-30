import type { useTableStore } from '$ui'

// Types
import type { ITableSortItem } from '../types/table-sort-item.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

export function tableBuildFetchPayload(payload: {
  columns: TableColumn[]
  queryBuilder: IQueryBuilderRow[]
  search: string
  pagination: { skip: number, take: number }
  orderBy?: ITableSortItem[]
  fetchMore?: { lastRow: IItem, hasMore: boolean }
  queryParams?: URLSearchParams
  getStore: () => ReturnType<typeof useTableStore>

  /**
   * Whether to include fields that are marked as `alwaysSelected` or
   * as part of the `needsFields` of a column
   */
  includeInvisible?: boolean
}) {
  const {
    columns,
    fetchMore,
    queryBuilder,
    search,
    pagination,
    orderBy,
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
      orderBy,
    },
    queryParams,
    fetchMore,
    getStore,
  }
}

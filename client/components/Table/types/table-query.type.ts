// Types
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

export type ITableQuery = {
  /**
   * All table columns (including any internal column, like `_selectable`)
   */
  columns: TableColumn[]

  /**
   * When fetching more data, this prop will include the last row in the table
   */
  fetchMore?: { lastRow: IItem, hasMore: boolean }

  /**
   * Active query builder rows
   */
  queryBuilder: IQueryBuilderRow[]

  /**
   * The search query
   */
  search: string

  /**
   * Pagination
   */
  pagination: { skip: number, take: number }
}

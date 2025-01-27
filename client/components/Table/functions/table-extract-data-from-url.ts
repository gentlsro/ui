// Types
import type { ITableProps } from '../types/table-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableExtractFiltersFromUrl } from './table-extract-filters-from-url'
import { tableExtractSortingFromUrl } from './table-extract-sorting-from-url'
import { tableExtractSelectedColumnsFromUrl } from './table-extract-selected-columns-from-url'
import { tableExtractPaginationFromUrl } from './table-extract-pagination-from-url'

/**
 * Extracts the relevant data from URL
 */
export function tableExtractDataFromUrl(payload: {
  columns?: MaybeRefOrGetter<TableColumn[]>
  searchParams?: URLSearchParams | string
  modifiers?: ITableProps['modifiers']
}) {
  const {
    columns,
    searchParams,
    modifiers,
  } = payload

  console.log(payload.modifiers)
  const {
    extractFiltersFromUrl = tableExtractFiltersFromUrl,
    extractSortingFromUrl = tableExtractSortingFromUrl,
    extractSelectedColumnsFromUrl = tableExtractSelectedColumnsFromUrl,
    extractPaginationFromUrl = tableExtractPaginationFromUrl,
  } = modifiers ?? {}

  const params = new URLSearchParams(searchParams ?? '')
  const _columns = toValue(columns)

  // Sorting
  const sort = extractSortingFromUrl(params)

  // Column filters & Query builder filters
  const { queryBuilder, filters } = extractFiltersFromUrl({
    searchParams: params,
    columns: _columns,
    modifiers,
  })

  // Column selection
  const visibleColumns = extractSelectedColumnsFromUrl(params, _columns)

  // Pagination
  const pagination = extractPaginationFromUrl(params)

  return {
    sort,
    queryBuilder,
    filters,
    visibleColumns,
    pagination,
  }
}

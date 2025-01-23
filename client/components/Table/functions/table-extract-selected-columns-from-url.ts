// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Extracts the selected columns (and their order) from the URL
 * The URL might look like: `?select=name.value,id,description`
 */
export function tableExtractSelectedColumnsFromUrl(
  params: URLSearchParams,
  columns?: TableColumn[],
) {
  const select = params.get('select')

  if (select === '*') {
    return (columns ?? [])
      .filter(col => !col.nonInteractive && !col.isHelperCol)
      .map(col => col.field)
  }

  const selectFields = select?.split(',') ?? []

  return selectFields
}

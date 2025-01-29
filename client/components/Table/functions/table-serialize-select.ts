// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Serializes the selected columns from the internal structure to the URL
 *
 * You can provide either `columns` or `select`
 */
export function tableSerializeSelect(payload: {
  columns?: TableColumn[]
  select?: string[]
}) {
  const { columns = [], select } = payload

  // The select that user sees in the URL
  const _select = select ?? columns
    .filter(col => !col.isHelperCol && !col.hidden)
    .map(col => col.field)

  // The select that is used for the fetch
  const _fetchSelect = select ?? columns
    .filter(col => col.alwaysSelected || (!col.isHelperCol && !col.hidden))
    .flatMap(col => [...(col.local ? [] : [col.field]), ...(col.needsFields ?? [])])

  return {
    select: uniq(_select).join(','),
    fetchSelect: uniq(_fetchSelect).join(','),
  }
}

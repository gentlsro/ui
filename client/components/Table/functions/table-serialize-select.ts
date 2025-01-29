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
}): string {
  const { columns = [], select } = payload

  // The select that user sees in the URL
  const _select = select ?? columns
    .filter(col => !col.isHelperCol && !col.hidden)
    .map(col => col.field)

  return uniq(_select).join(',')
}

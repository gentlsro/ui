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

  const _select = select ?? columns
    .filter(col => !col.isHelperCol && !col.hidden)
    .flatMap(col => [...(col.local ? [] : [col.field]), ...(col.needsFields ?? [])])

  return _select.join(',')
}

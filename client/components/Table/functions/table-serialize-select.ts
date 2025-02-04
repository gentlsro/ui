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

  /**
   * When true, the select will also include the columns that are not visible but
   * are `alwaysSelected` or part of th `needsFields` list
   */
  includeInvisible?: boolean
}): string {
  const { columns = [], select, includeInvisible } = payload

  let _select: string[]

  if (includeInvisible) {
    _select = select ?? columns
      .filter(col => col.alwaysSelected || (!col.isHelperCol && !col.hidden))
      .flatMap(col => [...(col.local ? [] : [col.field]), ...(col.needsFields ?? [])])
  } else {
    _select = select ?? columns
      .filter(col => !col.isHelperCol && !col.hidden)
      .map(col => col.field)
  }

  return uniq(_select).join(',')
}

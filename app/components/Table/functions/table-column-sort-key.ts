// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Helper columns are always pinned before any other column
 */
export const TABLE_HELPER_COL_SORT = -1000

/**
 * Returns the key the columns are ordered by. Helper columns always win over
 * the (possibly restored) `_internalSort`, columns without any sort go last
 */
export function tableColumnSortKey(col: Pick<TableColumn, 'isHelperCol' | '_internalSort'>) {
  return col.isHelperCol
    ? TABLE_HELPER_COL_SORT
    : (col._internalSort ?? Number.MAX_SAFE_INTEGER)
}

/**
 * Comparator for ordering the table columns
 */
export function tableCompareColumnsBySort(
  a: Pick<TableColumn, 'isHelperCol' | '_internalSort'>,
  b: Pick<TableColumn, 'isHelperCol' | '_internalSort'>,
) {
  return tableColumnSortKey(a) - tableColumnSortKey(b)
}

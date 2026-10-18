import { describe, expect, it } from 'vitest'

import {
  TABLE_HELPER_COL_SORT,
  tableColumnSortKey,
  tableCompareColumnsBySort,
} from '../app/components/Table/functions/table-column-sort-key'

describe('table column sort key', () => {
  it('pins helper columns first regardless of `_internalSort`', () => {
    expect(tableColumnSortKey({ isHelperCol: true })).toBe(TABLE_HELPER_COL_SORT)
    expect(tableColumnSortKey({ isHelperCol: true, _internalSort: Number.MAX_SAFE_INTEGER })).toBe(TABLE_HELPER_COL_SORT)
    expect(tableColumnSortKey({ isHelperCol: false, _internalSort: 3 })).toBe(3)
    expect(tableColumnSortKey({ isHelperCol: false })).toBe(Number.MAX_SAFE_INTEGER)
  })

  it('keeps a helper column without a restored sort ahead of restored data columns', () => {
    // Data columns come back from the saved state with `_internalSort`,
    // helper columns are never persisted so they have none
    const columns = [
      { field: 'ordinalNumber', isHelperCol: true, _internalSort: undefined },
      { field: 'name', isHelperCol: false, _internalSort: 1 },
      { field: 'id', isHelperCol: false, _internalSort: 0 },
    ]

    expect(columns.toSorted(tableCompareColumnsBySort).map(col => col.field))
      .toEqual(['ordinalNumber', 'id', 'name'])
  })

  it('keeps the declaration order of multiple helper columns', () => {
    const columns = [
      { field: 'name', isHelperCol: false, _internalSort: 0 },
      { field: 'selection', isHelperCol: true },
      { field: 'ordinalNumber', isHelperCol: true, _internalSort: Number.MAX_SAFE_INTEGER },
    ]

    expect(columns.toSorted(tableCompareColumnsBySort).map(col => col.field))
      .toEqual(['selection', 'ordinalNumber', 'name'])
  })
})

import { describe, expect, it } from 'vitest'

import { tableGetPageRange } from '../app/components/Table/functions/table-get-page-range'

describe('table page range', () => {
  it('uses 1-based row numbers', () => {
    expect(tableGetPageRange({ currentPage: 1, pageSize: 10, rowsCount: 10 })).toEqual({ from: 1, to: 10 })
    expect(tableGetPageRange({ currentPage: 3, pageSize: 25, rowsCount: 25 })).toEqual({ from: 51, to: 75 })
  })

  it('ends the last page at the last fetched row', () => {
    expect(tableGetPageRange({ currentPage: 3, pageSize: 100, rowsCount: 50 })).toEqual({ from: 201, to: 250 })
  })

  it('reads 0 - 0 for an empty result set', () => {
    expect(tableGetPageRange({ currentPage: 1, pageSize: 100, rowsCount: 0 })).toEqual({ from: 0, to: 0 })
  })

  it('never renders a negative range for an out-of-range page', () => {
    expect(tableGetPageRange({ currentPage: 0, pageSize: 100, rowsCount: 0 })).toEqual({ from: 0, to: 0 })
    expect(tableGetPageRange({ currentPage: 0, pageSize: 100, rowsCount: 5 })).toEqual({ from: 1, to: 5 })
  })
})

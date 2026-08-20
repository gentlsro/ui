import { describe, expect, it, vi } from 'vitest'
import { toValue } from 'vue'
import { tableExtractDataFromUrl } from './table-extract-data-from-url'

vi.mock('./table-extract-filters-from-url', () => ({
  tableExtractFiltersFromUrl: vi.fn(),
}))

vi.mock('./table-extract-sorting-from-url', () => ({
  tableExtractSortingFromUrl: vi.fn(),
}))

vi.mock('./table-extract-selected-columns-from-url', () => ({
  tableExtractSelectedColumnsFromUrl: vi.fn(),
}))

vi.mock('./table-extract-pagination-from-url', () => ({
  tableExtractPaginationFromUrl: vi.fn(),
}))

vi.stubGlobal('toValue', toValue)

describe('tableExtractDataFromUrl', () => {
  it('extracts search and routes params through custom modifiers', () => {
    const params = new URLSearchParams('search=needle&custom=value')
    const extractFiltersFromUrl = vi.fn(() => ({ filters: ['filter'], queryBuilder: ['query-builder'] }))
    const extractSortingFromUrl = vi.fn(() => ['sorting'])
    const extractSelectedColumnsFromUrl = vi.fn(() => ['selection'])
    const extractPaginationFromUrl = vi.fn(() => ({ skip: 20, take: 10 }))

    const result = tableExtractDataFromUrl({
      searchParams: params,
      modifiers: {
        extractFiltersFromUrl,
        extractSortingFromUrl,
        extractSelectedColumnsFromUrl,
        extractPaginationFromUrl,
      } as never,
    })

    expect(result).toEqual({
      filters: ['filter'],
      pagination: { skip: 20, take: 10 },
      queryBuilder: ['query-builder'],
      search: 'needle',
      sort: ['sorting'],
      visibleColumns: ['selection'],
    })
    expect(extractFiltersFromUrl).toHaveBeenCalledWith(expect.objectContaining({
      searchParams: expect.any(URLSearchParams),
    }))
    expect(extractSortingFromUrl).toHaveBeenCalledWith(expect.any(URLSearchParams))
    expect(extractSelectedColumnsFromUrl).toHaveBeenCalledWith(expect.any(URLSearchParams), undefined)
    expect(extractPaginationFromUrl).toHaveBeenCalledWith(expect.any(URLSearchParams))
    expect(params.toString()).toBe('search=needle&custom=value')
  })
})

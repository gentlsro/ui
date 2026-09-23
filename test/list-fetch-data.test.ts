import { get, isNil } from 'lodash-es'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { listFetchData } from '../app/components/List/functions/list-fetch-data'

// `get` and `isNil` are Nuxt auto-imports in the app
beforeAll(() => {
  vi.stubGlobal('get', get)
  vi.stubGlobal('isNil', isNil)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

function fetchWith(res: any, options?: { payloadKey?: string, isFetchMore?: boolean, items?: any[] }) {
  return listFetchData({
    fn: async fnc => fnc(() => new AbortController()),
    loadData: { fnc: async () => res, payloadKey: options?.payloadKey } as any,
    items: options?.items ?? [],
    isFetchMore: options?.isFetchMore,
  })
}

describe('listFetchData', () => {
  it('reads items through `payloadKey`', async () => {
    const result = await fetchWith({ data: [{ id: 1 }, { id: 2 }] }, { payloadKey: 'data' })

    expect(result).toEqual({ hasMore: false, items: [{ id: 1 }, { id: 2 }], totalRows: 2 })
  })

  it('degrades to an empty list when the response is missing', async () => {
    await expect(fetchWith(undefined)).resolves.toEqual({ hasMore: false, items: [], totalRows: 0 })
    await expect(fetchWith(undefined, { payloadKey: 'data' })).resolves.toMatchObject({ items: [] })
  })

  it('degrades to an empty list when `payloadKey` misses', async () => {
    const result = await fetchWith({ rows: [{ id: 1 }] }, { payloadKey: 'data' })

    expect(result).toEqual({ hasMore: false, items: [], totalRows: 0 })
  })

  it('keeps current items when fetching more returns nothing', async () => {
    const result = await fetchWith(undefined, { isFetchMore: true, items: [{ id: 1 }] })

    expect(result).toMatchObject({ items: [{ id: 1 }] })
  })
})

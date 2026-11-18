import { describe, expect, it } from 'vitest'

import { listFetchData } from './list-fetch-data'

type FetchOptions = {
  payloadKey?: string
  isFetchMore?: boolean
  items?: any[]
  totalRows?: number
}

function fetchWith(res: any, options?: FetchOptions) {
  return listFetchData({
    fn: async fnc => fnc(() => new AbortController()),
    loadData: { fnc: async () => res, payloadKey: options?.payloadKey } as any,
    items: options?.items ?? [],
    isFetchMore: options?.isFetchMore,
    totalRows: options?.totalRows,
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

  it('stops asking for more when fetching more returns nothing', async () => {
    const result = await fetchWith(undefined, {
      isFetchMore: true,
      items: [{ id: 1 }],
      totalRows: 10,
    })

    expect(result).toMatchObject({ hasMore: false, totalRows: 10 })
  })

  it('ignores a superseded request that swallowed its abort', async () => {
    const controller = new AbortController()

    const result = await listFetchData({
      fn: async fnc => fnc(() => controller),
      loadData: {
        fnc: async () => {
          controller.abort()
        },
      } as any,
      items: [{ id: 1 }],
    })

    expect(result).toBeUndefined()
  })
})

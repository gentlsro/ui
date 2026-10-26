import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { buildListItems, useListItemsTransformer } from './build-list-items'

const options = { fuseOptions: { keys: ['label'] }, sortBy: [], addedItemById: {} }

describe('list data contracts', () => {
  it('provides synchronous built-in results while preserving the async helper API', async () => {
    const transform = useListItemsTransformer()
    const items = [{ id: 0, label: 'Zero' }, { id: 1, label: 'One' }]
    const payload = { ...options, items, search: 'Zero', searchConfig: { enabled: false } }
    const result = transform(payload)
    expect(result).not.toBeInstanceOf(Promise)
    expect(result).toMatchObject({ hasExactMatch: true, items: [{ id: 0, label: 'Zero' }, { id: 1, label: 'One' }] })
    expect(buildListItems(payload)).toBeInstanceOf(Promise)
    expect(await buildListItems(payload)).toEqual(result)
  })

  it('preserves IDs, source records and order for generated unsorted data', () => {
    const transform = useListItemsTransformer()
    fc.assert(fc.property(fc.uniqueArray(fc.integer(), { maxLength: 50 }), ids => {
      const items = ids.map(id => ({ id, label: `Record ${id}` }))
      const result = transform({ ...options, items, searchConfig: { enabled: false }, sortingConfig: { enabled: false } })
      expect(result).not.toBeInstanceOf(Promise)
      if ('then' in result) {
        throw new Error('Built-in list transforms must finish before rendering')
      }
      expect(result.items.map(item => item.id)).toEqual(ids)
      expect(result.items.map(item => item.ref)).toEqual(items)
      expect(items).toEqual(ids.map(id => ({ id, label: `Record ${id}` })))
    }))
  })

  it('preserves a custom asynchronous search and propagates its failure to its owner', async () => {
    const transform = useListItemsTransformer()
    const result = transform({
      ...options,
      items: [{ id: 0, label: 'Zero' }],
      searchConfig: { enabled: true, fnc: async () => [{ id: 1, label: 'One' }] },
    })
    expect(await result).toMatchObject({ items: [{ id: 1, label: 'One' }] })
    await expect(transform({
      ...options,
      items: [],
      searchConfig: { enabled: true, fnc: async () => {
        throw new Error('Search unavailable')
      } },
    })).rejects.toThrow('Search unavailable')
  })
})

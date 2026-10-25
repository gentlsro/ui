/**
 * Search and validation over the icon catalog (`icon-catalog-search.ts`).
 *
 * Failure modes, written before the implementation:
 * 1. A query typed with spaces ("arrow right") misses `arrow-right`.
 * 2. Case or surrounding whitespace in the query changes the result.
 * 3. An empty query lists the whole catalog instead of nothing.
 * 4. `set:` typed in the query is searched as text instead of narrowing to that set; an unknown set leaks other sets.
 * 5. Ranking buries the exact name under longer partial matches, or ignores the set order of the catalog.
 * 6. Hidden icons or alias names show up as results (duplicates of the canonical icon).
 * 7. `limit` is ignored or unbounded; `total` counts only the returned page.
 * 8. Validation rejects a saved alias, a hidden icon or an `i-` prefixed value, or accepts an unknown set or name.
 * 9. Characters with a regex meaning ("c++", "(") throw.
 *
 * Run: `vp test packages/UI/modules/icon-catalog`
 */
import { describe, expect, it } from 'vitest'

import { checkIcons, searchIcons } from './icon-catalog-search'
import type { IconCatalog } from './icon-catalog-search'

const catalog: IconCatalog = [
  { prefix: 'lucide', names: ['arrow-right', 'arrow-right-left', 'circle-arrow-right', 'house', 'plus'], hidden: ['home', 'old-arrow'] },
  { prefix: 'mdi', names: ['arrow-right', 'arrow-right-bold', 'home', 'home-outline', 'plus-circle'], hidden: [] },
]

describe('searchIcons', () => {
  it('matches every word of a query typed with spaces (1)', () => {
    expect(searchIcons(catalog, 'arrow right').icons).toContain('lucide:arrow-right-left')
    expect(searchIcons(catalog, 'right arrow').icons).toContain('mdi:arrow-right-bold')
  })

  it('ignores case and surrounding whitespace (2)', () => {
    expect(searchIcons(catalog, '  HOUSE ').icons).toEqual(['lucide:house'])
  })

  it('returns nothing for an empty query (3)', () => {
    expect(searchIcons(catalog, '   ')).toEqual({ icons: [], total: 0 })
  })

  it('narrows to a typed set, and an unknown set finds nothing (4)', () => {
    expect(searchIcons(catalog, 'mdi:home').icons).toEqual(['mdi:home', 'mdi:home-outline'])
    expect(searchIcons(catalog, 'mdi:').icons).toHaveLength(5)
    expect(searchIcons(catalog, 'nope:home').icons).toEqual([])
  })

  it('ranks the exact name first, then name starts, then the rest; set order breaks ties (5)', () => {
    expect(searchIcons(catalog, 'arrow-right').icons).toEqual([
      'lucide:arrow-right',
      'mdi:arrow-right',
      'lucide:arrow-right-left',
      'mdi:arrow-right-bold',
      'lucide:circle-arrow-right',
    ])
  })

  it('never offers hidden icons or aliases (6)', () => {
    expect(searchIcons(catalog, 'home').icons).toEqual(['mdi:home', 'mdi:home-outline'])
    expect(searchIcons(catalog, 'old-arrow').icons).toEqual([])
  })

  it('returns one page and counts every match (7)', () => {
    expect(searchIcons(catalog, 'arrow', { limit: 2 })).toEqual({ icons: ['lucide:arrow-right', 'mdi:arrow-right'], total: 5 })
    expect(searchIcons(catalog, 'arrow', { limit: 10_000 }).icons.length).toBeLessThanOrEqual(200)
  })

  it('treats regex characters as text (9)', () => {
    expect(() => searchIcons(catalog, 'c++ (')).not.toThrow()
  })
})

describe('checkIcons', () => {
  it('accepts canonical names, aliases, hidden icons and i- prefixed values (8)', () => {
    expect(checkIcons(catalog, ['lucide:house', 'lucide:home', 'i-mdi:home', 'i-lucide:old-arrow'])).toEqual({
      valid: ['lucide:house', 'lucide:home', 'i-mdi:home', 'i-lucide:old-arrow'],
      invalid: [],
    })
  })

  it('rejects unknown sets, unknown names and values without a set (8)', () => {
    expect(checkIcons(catalog, ['fa:house', 'lucide:nope', 'house'])).toEqual({
      valid: [],
      invalid: ['fa:house', 'lucide:nope', 'house'],
    })
  })
})

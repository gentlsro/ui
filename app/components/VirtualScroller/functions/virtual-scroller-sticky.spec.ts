import { describe, expect, it } from 'vitest'
import {
  addActiveStickyIndex,
  getActiveStickyIndex,
  normalizeStickyIndices,
} from './virtual-scroller-sticky'

describe('normalizeStickyIndices', () => {
  it('sorts, deduplicates, and drops invalid indices', () => {
    expect(normalizeStickyIndices([12, 0, 5, 5, -1, 2.5, Number.NaN])).toEqual([0, 5, 12])
  })

  it('handles a missing list', () => {
    expect(normalizeStickyIndices(undefined)).toEqual([])
  })
})

describe('getActiveStickyIndex', () => {
  const sticky = [0, 5, 12]

  it('picks the last sticky row at or above the first rendered row', () => {
    expect(getActiveStickyIndex(sticky, 4)).toBe(0)
    expect(getActiveStickyIndex(sticky, 7)).toBe(5)
    expect(getActiveStickyIndex(sticky, 12)).toBe(12)
    expect(getActiveStickyIndex(sticky, 1_000)).toBe(12)
  })

  it('has no active row before the first sticky row', () => {
    expect(getActiveStickyIndex([3, 8], 2)).toBeUndefined()
    expect(getActiveStickyIndex([], 10)).toBeUndefined()
    expect(getActiveStickyIndex(sticky, undefined)).toBeUndefined()
  })

  it('finds the boundaries of a long list', () => {
    const long = Array.from({ length: 10_000 }, (_, index) => index * 3)

    expect(getActiveStickyIndex(long, 0)).toBe(0)
    expect(getActiveStickyIndex(long, 29_998)).toBe(29_997)
    expect(getActiveStickyIndex(long, 29_999)).toBe(29_997)
    expect(getActiveStickyIndex(long, 50_000)).toBe(29_997)
    expect(getActiveStickyIndex(long, 14_999)).toBe(14_997)
  })
})

describe('addActiveStickyIndex', () => {
  it('renders the active sticky row before the range when it scrolled out of it', () => {
    expect(addActiveStickyIndex([20, 21, 22], { activeIndex: 5, count: 30 })).toEqual([5, 20, 21, 22])
  })

  it('does not duplicate an active row that is already rendered', () => {
    expect(addActiveStickyIndex([4, 5, 6], { activeIndex: 5, count: 30 })).toEqual([4, 5, 6])
  })

  it('keeps the range when there is no active row', () => {
    const indexes = [4, 5, 6]

    expect(addActiveStickyIndex(indexes, { activeIndex: undefined, count: 30 })).toBe(indexes)
  })

  it('ignores an active row outside the current rows (stale sticky indices)', () => {
    expect(addActiveStickyIndex([0, 1], { activeIndex: 2, count: 2 })).toEqual([0, 1])
  })

  it('does not render anything for an empty range (cleared scroller)', () => {
    expect(addActiveStickyIndex([], { activeIndex: 0, count: 30 })).toEqual([])
  })
})

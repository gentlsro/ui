/**
 * Sticky rows (e.g. group headers): the last sticky row at or above the first rendered row stays rendered and
 * pinned to the top while its rows scroll by.
 *
 * @see https://tanstack.com/virtual/latest/docs/framework/vue/examples/sticky
 */

/** Sorted, unique, non-negative integer indices (the lookups below binary-search them) */
export function normalizeStickyIndices(indices?: number[]) {
  const valid = (indices ?? []).filter(index => Number.isInteger(index) && index >= 0)

  return [...new Set(valid)].sort((a, b) => a - b)
}

/** The last sticky index `<= startIndex`, found by binary search on normalized indices */
export function getActiveStickyIndex(stickyIndices: number[], startIndex?: number) {
  if (startIndex === undefined || !stickyIndices.length) {
    return
  }

  let low = 0
  let high = stickyIndices.length - 1
  let active: number | undefined

  while (low <= high) {
    const middle = (low + high) >> 1
    const index = stickyIndices[middle]!

    if (index <= startIndex) {
      active = index
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return active
}

/**
 * Adds the active sticky row to the rendered indexes (ascending), unless nothing is rendered (a cleared scroller)
 * or the index no longer exists
 */
export function addActiveStickyIndex(
  indexes: number[],
  payload: { activeIndex?: number, count: number },
) {
  const { activeIndex, count } = payload

  if (activeIndex === undefined || activeIndex >= count || !indexes.length || indexes.includes(activeIndex)) {
    return indexes
  }

  return [activeIndex, ...indexes].sort((a, b) => a - b)
}

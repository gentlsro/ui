import { describe, expect, it } from 'vitest'
import { isPivotRowCellHiddenByCollapsedAncestor } from './pivot-group-collapse'
import { isPivotColumnHeaderHidden } from './pivot-column-collapse'

/**
 * A collapsed set that only answers `has`: with every group collapsed on a large hierarchy, scanning the set per
 * rendered cell or header is O(cells x groups), so the ancestor checks must look up the cell's own ancestors
 */
class LookupOnlySet extends Set<string> {
  override [Symbol.iterator](): SetIterator<string> {
    throw new Error('The collapsed set must not be iterated')
  }

  override forEach(): void {
    throw new Error('The collapsed set must not be iterated')
  }

  override values(): SetIterator<string> {
    throw new Error('The collapsed set must not be iterated')
  }

  override keys(): SetIterator<string> {
    throw new Error('The collapsed set must not be iterated')
  }

  override entries(): SetIterator<[string, string]> {
    throw new Error('The collapsed set must not be iterated')
  }
}

function collapsed(...ids: string[]) {
  const set = new LookupOnlySet()

  ids.forEach(id => Set.prototype.add.call(set, id))

  return set
}

describe('row cell hidden by a collapsed ancestor', () => {
  it('is hidden when any ancestor level is collapsed', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('2:a/b/c', collapsed('0:a'))).toBe(true)
    expect(isPivotRowCellHiddenByCollapsedAncestor('2:a/b/c', collapsed('1:a/b'))).toBe(true)
  })

  it('is not hidden when only its own group is collapsed', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:a/b', collapsed('1:a/b'))).toBe(false)
  })

  it('is not hidden by a collapsed descendant or a group of another branch', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('0:a', collapsed('1:a/b'))).toBe(false)
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:x/b', collapsed('0:a'))).toBe(false)
  })

  it('is not hidden by a sibling whose key is a string prefix of its own', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:ab/c', collapsed('0:a'))).toBe(false)
  })

  it('keeps encoded separators inside a key', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('0:a%2Fb', collapsed('0:a'))).toBe(false)
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:a%2Fb/c', collapsed('0:a%2Fb'))).toBe(true)
  })

  it('treats an empty key as a real ancestor', () => {
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:/x', collapsed('0:'))).toBe(true)
  })

  it('is never hidden for grand total, placeholder, and empty-row cells', () => {
    // Grand total cells: `<index>:` with an empty path; cells past the row's depth repeat the row's path
    expect(isPivotRowCellHiddenByCollapsedAncestor('0:', collapsed('0:'))).toBe(false)
    expect(isPivotRowCellHiddenByCollapsedAncestor('1:a', collapsed('0:a'))).toBe(false)
    expect(isPivotRowCellHiddenByCollapsedAncestor('', collapsed('0:'))).toBe(false)
  })
})

describe('column header hidden by a collapsed ancestor', () => {
  it('is hidden when any ancestor level is collapsed', () => {
    expect(isPivotColumnHeaderHidden('c:1:2024/Q1', collapsed('c:0:2024'))).toBe(true)
    expect(isPivotColumnHeaderHidden('c:2:a/b/c', collapsed('c:1:a/b'))).toBe(true)
  })

  it('is not hidden when only its own group is collapsed', () => {
    expect(isPivotColumnHeaderHidden('c:0:2024', collapsed('c:0:2024'))).toBe(false)
  })

  it('is not hidden by a sibling whose key is a string prefix of its own', () => {
    expect(isPivotColumnHeaderHidden('c:1:2024/Q1', collapsed('c:0:202'))).toBe(false)
  })

  it('is not hidden by collapsed row groups or unknown ids', () => {
    expect(isPivotColumnHeaderHidden('c:1:2024/Q1', collapsed('0:2024'))).toBe(false)
    expect(isPivotColumnHeaderHidden('header:grand-total', collapsed('c:0:2024'))).toBe(false)
  })
})

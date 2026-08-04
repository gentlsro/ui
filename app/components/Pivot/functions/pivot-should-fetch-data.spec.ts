import { describe, expect, it, vi } from 'vitest'
import { shouldFetchPivotData } from './pivot-should-fetch-data'

describe('pivot source loading', () => {
  it('never overwrites a supplied static data prop', () => {
    const payload = {
      data: [],
      loadData: { fnc: vi.fn(), immediate: true },
    }

    expect(shouldFetchPivotData(payload, 'setup')).toBe(false)
    expect(shouldFetchPivotData(payload, 'mounted')).toBe(false)
  })

  it('only fetches when a loader exists and in its configured phase', () => {
    expect(shouldFetchPivotData({}, 'mounted')).toBe(false)
    expect(shouldFetchPivotData({ loadData: { fnc: vi.fn(), immediate: true } }, 'setup')).toBe(true)
    expect(shouldFetchPivotData({ loadData: { fnc: vi.fn() } }, 'mounted')).toBe(true)
  })
})

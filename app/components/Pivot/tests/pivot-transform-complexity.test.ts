import { describe, expect, it, vi } from 'vitest'
import {
  getPivotTransformComplexity,
  PIVOT_TRANSFORM_WORKER_THRESHOLD,
  shouldUsePivotTransformWorker,
} from '../functions/pivot-transform-complexity'

describe('getPivotTransformComplexity', () => {
  it('combines data count with row, column, and value dimension counts', () => {
    expect(getPivotTransformComplexity({
      dataCount: 10_000,
      rowCount: 3,
      columnCount: 2,
      valueCount: 2,
    })).toBe(70_000)
  })

  it('uses at least one dimension when all counts are zero', () => {
    expect(getPivotTransformComplexity({
      dataCount: 100,
      rowCount: 0,
      columnCount: 0,
      valueCount: 0,
    })).toBe(100)
  })
})

describe('shouldUsePivotTransformWorker', () => {
  it('enables worker at or above threshold', () => {
    vi.stubGlobal('Worker', class Worker {})

    expect(shouldUsePivotTransformWorker({
      dataCount: 10_000,
      rowCount: 3,
      columnCount: 2,
      valueCount: 2,
    })).toBe(true)
  })

  it('disables worker below threshold', () => {
    expect(shouldUsePivotTransformWorker({
      dataCount: 100,
      rowCount: 2,
      columnCount: 1,
      valueCount: 1,
    })).toBe(false)
  })

  it('disables worker when summaryFormat is used', () => {
    expect(shouldUsePivotTransformWorker({
      dataCount: 10_000,
      rowCount: 3,
      columnCount: 2,
      valueCount: 2,
      hasSummaryFormat: true,
    })).toBe(false)
  })

  it('exports a reasonable default threshold', () => {
    expect(PIVOT_TRANSFORM_WORKER_THRESHOLD).toBeGreaterThan(0)
  })
})

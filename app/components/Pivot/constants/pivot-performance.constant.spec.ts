import { describe, expect, it } from 'vitest'
import { isPivotPerformanceOverBudget } from './pivot-performance.constant'

/**
 * The warning pauses a transform after aggregation, before its rows and value matrices are built. Measured costs
 * (typed-array values, virtualized value columns): cells ~55 ns each in the worker and 9 bytes of memory; output
 * rows ~6 µs each to copy from the worker plus ~0.75 µs per collapse toggle; value columns ~90 µs each to render
 * the (not virtualized) header. The defaults warn around a second of work or ~100 MB.
 */

const typicalLargePivot = {
  sourceRowCount: 1_000_000,
  projectedRowCount: 50_000,
  valueColumnCount: 1_000,
  logicalCellCount: 5_000_000,
}

describe('pivot performance warning defaults', () => {
  it('lets pivots that are fast now run without a warning', () => {
    expect(isPivotPerformanceOverBudget(typicalLargePivot)).toBe(false)
  })

  it('warns above 10M output cells', () => {
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, logicalCellCount: 10_000_000 })).toBe(false)
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, logicalCellCount: 10_000_001 })).toBe(true)
  })

  it('warns above 100k output rows', () => {
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, projectedRowCount: 100_000 })).toBe(false)
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, projectedRowCount: 100_001 })).toBe(true)
  })

  it('warns above 5000 value columns', () => {
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, valueColumnCount: 5_000 })).toBe(false)
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, valueColumnCount: 5_001 })).toBe(true)
  })

  it('does not warn about source rows unless configured (aggregation already ran when the warning shows)', () => {
    expect(isPivotPerformanceOverBudget({ ...typicalLargePivot, sourceRowCount: 50_000_000 })).toBe(false)
    expect(isPivotPerformanceOverBudget(typicalLargePivot, { sourceRowWarningThreshold: 100_000 })).toBe(true)
  })

  it('applies configured limits over the defaults', () => {
    expect(isPivotPerformanceOverBudget(typicalLargePivot, { outputRowWarningThreshold: 10_000 })).toBe(true)
    expect(isPivotPerformanceOverBudget(
      { ...typicalLargePivot, valueColumnCount: 20_000 },
      { valueColumnWarningThreshold: Infinity },
    )).toBe(false)
  })
})

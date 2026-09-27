import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'

/**
 * When a transform pauses to ask before building its rows and value matrices. Measured costs: cells ~55 ns each
 * (in the worker) and 9 bytes of memory; output rows ~6 µs each to copy from the worker plus ~0.75 µs per collapse
 * toggle; value columns ~90 µs each to render the header, which is not virtualized. The defaults warn around a
 * second of work or ~100 MB.
 */
export const PIVOT_DEFAULT_PERFORMANCE = {
  // The warning shows after aggregation, so it cannot save the source rows' cost; only checked when configured
  sourceRowWarningThreshold: Infinity,
  outputRowWarningThreshold: 100_000,
  outputCellWarningThreshold: 10_000_000,
  valueColumnWarningThreshold: 5_000,
} as const

export type IPivotPerformanceConfig = {
  sourceRowWarningThreshold?: number
  outputRowWarningThreshold?: number
  outputCellWarningThreshold?: number
  valueColumnWarningThreshold?: number
}

export function resolvePivotPerformanceConfig(config?: IPivotPerformanceConfig) {
  return {
    ...PIVOT_DEFAULT_PERFORMANCE,
    ...config,
  }
}

export function isPivotPerformanceOverBudget(
  estimate: IPivotTransformEstimate,
  config?: IPivotPerformanceConfig,
) {
  const resolved = resolvePivotPerformanceConfig(config)

  return estimate.sourceRowCount > resolved.sourceRowWarningThreshold
    || estimate.projectedRowCount > resolved.outputRowWarningThreshold
    || estimate.logicalCellCount > resolved.outputCellWarningThreshold
    || estimate.valueColumnCount > resolved.valueColumnWarningThreshold
}

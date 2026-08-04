import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'

export const PIVOT_DEFAULT_PERFORMANCE = {
  sourceRowWarningThreshold: 100_000,
  outputCellWarningThreshold: 250_000,
  valueColumnWarningThreshold: 250,
} as const

export type IPivotPerformanceConfig = {
  sourceRowWarningThreshold?: number
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
    || estimate.logicalCellCount > resolved.outputCellWarningThreshold
    || estimate.valueColumnCount > resolved.valueColumnWarningThreshold
}

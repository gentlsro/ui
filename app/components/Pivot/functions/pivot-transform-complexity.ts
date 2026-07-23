export const PIVOT_TRANSFORM_WORKER_THRESHOLD = 20_000

/**
 * Single workload score from source row count + pivot dimension counts.
 * Higher = more transform work (grouping, aggregation, cell building).
 */
export function getPivotTransformComplexity(payload: {
  dataCount: number
  rowCount: number
  columnCount: number
  valueCount: number
}) {
  const { dataCount, rowCount, columnCount, valueCount } = payload
  const dimensions = rowCount + columnCount + valueCount

  return dataCount * Math.max(1, dimensions)
}

export function shouldUsePivotTransformWorker(payload: {
  dataCount: number
  rowCount: number
  columnCount: number
  valueCount: number
  hasSummaryFormat?: boolean
}) {
  if (typeof Worker === 'undefined') {
    return false
  }

  if (payload.hasSummaryFormat) {
    return false
  }

  return getPivotTransformComplexity(payload) >= PIVOT_TRANSFORM_WORKER_THRESHOLD
}

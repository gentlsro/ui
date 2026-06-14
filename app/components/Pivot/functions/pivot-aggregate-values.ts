import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'

// Models
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

type IPivotAccumulator = {
  summaryType: SummaryEnum
  count: number
  sum: number
  values?: number[]
}

export type IPivotAggregationIndex = {
  values: Map<string, number>
  matchCounts: Map<string, number>
}

function getPivotRowValue<T>(item: T, valueField: PivotValue<T>): number {
  if (valueField.summaryFormat) {
    const formatted = valueField.summaryFormat(item)

    return typeof formatted === 'number' ? formatted : 0
  }

  const raw = get(item, valueField.field)

  return typeof raw === 'number' ? raw : 0
}

function getPivotAggregationKey<T>(columnPath: string[], valueField: ObjectKey<T>): string {
  if (columnPath[0] === '__grand_total__') {
    return `__grand_total__|${String(valueField)}`
  }

  if (!columnPath.length) {
    return `|${String(valueField)}`
  }

  return `${columnPath.join('|')}|${String(valueField)}`
}

function getOrCreateAccumulator(
  accumulators: Map<string, IPivotAccumulator>,
  key: string,
  summaryType: SummaryEnum,
): IPivotAccumulator {
  let accumulator = accumulators.get(key)

  if (!accumulator) {
    accumulator = {
      summaryType,
      count: 0,
      sum: 0,
      values: summaryType === SummaryEnum.MEDIAN ? [] : undefined,
    }
    accumulators.set(key, accumulator)
  }

  return accumulator
}

function addToAccumulator(accumulator: IPivotAccumulator, numericValue: number) {
  accumulator.count += 1
  accumulator.sum += numericValue

  if (accumulator.summaryType === SummaryEnum.MEDIAN) {
    accumulator.values!.push(numericValue)
  }
}

function finalizeAccumulator(accumulator: IPivotAccumulator): number {
  switch (accumulator.summaryType) {
    case SummaryEnum.COUNT:
      return accumulator.count

    case SummaryEnum.SUM:
      return accumulator.sum

    case SummaryEnum.AVERAGE:
      return accumulator.count ? accumulator.sum / accumulator.count : 0

    case SummaryEnum.MEDIAN: {
      const values = accumulator.values!.toSorted((a, b) => a - b)

      return values[Math.floor(values.length / 2)] ?? 0
    }

    default:
      return accumulator.count
  }
}

export function buildPivotAggregationIndex<T>(payload: {
  items: T[]
  columnFields: PivotColumn<T>[]
  valueFields: PivotValue<T>[]
}): IPivotAggregationIndex {
  const { items, columnFields, valueFields } = payload
  const accumulators = new Map<string, IPivotAccumulator>()

  for (const item of items) {
    const columnPathKey = columnFields.length
      ? columnFields.map(field => String(get(item, field.field) ?? '')).join('|')
      : ''

    for (const valueField of valueFields) {
      const fieldKey = String(valueField.field)
      const numericValue = getPivotRowValue(item, valueField)

      if (columnFields.length) {
        addToAccumulator(
          getOrCreateAccumulator(accumulators, `${columnPathKey}|${fieldKey}`, valueField.summaryType),
          numericValue,
        )
      } else {
        addToAccumulator(
          getOrCreateAccumulator(accumulators, `|${fieldKey}`, valueField.summaryType),
          numericValue,
        )
      }

      addToAccumulator(
        getOrCreateAccumulator(accumulators, `__grand_total__|${fieldKey}`, valueField.summaryType),
        numericValue,
      )
    }
  }

  const values = new Map<string, number>()
  const matchCounts = new Map<string, number>()

  for (const [key, accumulator] of accumulators) {
    values.set(key, finalizeAccumulator(accumulator))
    matchCounts.set(key, accumulator.count)
  }

  return { values, matchCounts }
}

export function getPivotAggregatedValue<T>(payload: {
  index: IPivotAggregationIndex
  columnPath: string[]
  valueField: ObjectKey<T>
}): { aggregated: number, matchCount: number } {
  const key = getPivotAggregationKey(payload.columnPath, payload.valueField)

  return {
    aggregated: payload.index.values.get(key) ?? 0,
    matchCount: payload.index.matchCounts.get(key) ?? 0,
  }
}

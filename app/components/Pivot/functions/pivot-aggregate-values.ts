import { get } from 'lodash-es'

// Types
import type {
  IPivotTransformColumnField,
  IPivotTransformRowField,
  IPivotTransformValueField,
} from './pivot-transform-data-core'

// Functions
import { getPivotPathId } from './pivot-path-id'

type IPivotAccumulator = {
  summaryType: SummaryEnum
  count: number
  sum: number
  values?: number[]
}

type IPivotAggregatedValue = {
  aggregated: number
  matchCount: number
}

type IPivotAccumulatorIndex = Map<string, Map<string, Map<string, IPivotAccumulator>>>

export type IPivotAggregationIndex = {
  values: Map<string, Map<string, Map<string, IPivotAggregatedValue>>>
  rowPathCountByDepth: number[]
}

const GRAND_TOTAL_KEY = 'grand-total'
const EMPTY_PATH_KEY = 'empty-path'

function getPivotRowValue<T extends IItem>(item: T, valueField: IPivotTransformValueField<T>) {
  if (valueField.summaryFormat) {
    const formatted = valueField.summaryFormat(item)

    return typeof formatted === 'number' ? formatted : 0
  }

  const raw = get(item, valueField.field)

  return typeof raw === 'number' ? raw : 0
}

function getAggregationPathKey(path: string[], isGrandTotal = false) {
  if (isGrandTotal) {
    return GRAND_TOTAL_KEY
  }

  return path.length ? `path:${getPivotPathId(path)}` : EMPTY_PATH_KEY
}

function getOrCreateAccumulator(payload: {
  accumulators: IPivotAccumulatorIndex
  rowKey: string
  columnKey: string
  measureId: string
  summaryType: SummaryEnum
}) {
  const { accumulators, rowKey, columnKey, measureId, summaryType } = payload
  let columnAccumulators = accumulators.get(rowKey)

  if (!columnAccumulators) {
    columnAccumulators = new Map()
    accumulators.set(rowKey, columnAccumulators)
  }

  let measureAccumulators = columnAccumulators.get(columnKey)

  if (!measureAccumulators) {
    measureAccumulators = new Map()
    columnAccumulators.set(columnKey, measureAccumulators)
  }

  let accumulator = measureAccumulators.get(measureId)

  if (!accumulator) {
    accumulator = {
      summaryType,
      count: 0,
      sum: 0,
      values: summaryType === SummaryEnum.MEDIAN ? [] : undefined,
    }
    measureAccumulators.set(measureId, accumulator)
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

function finalizeAccumulator(accumulator: IPivotAccumulator) {
  switch (accumulator.summaryType) {
    case SummaryEnum.COUNT:
      return accumulator.count

    case SummaryEnum.SUM:
      return accumulator.sum

    case SummaryEnum.AVERAGE:
      return accumulator.count ? accumulator.sum / accumulator.count : 0

    case SummaryEnum.MEDIAN: {
      const values = accumulator.values!.toSorted((a, b) => a - b)
      const middle = Math.floor(values.length / 2)

      if (values.length % 2 === 0) {
        return ((values[middle - 1] ?? 0) + (values[middle] ?? 0)) / 2
      }

      return values[middle] ?? 0
    }

    default:
      return accumulator.count
  }
}

export function buildPivotAggregationIndex<T extends IItem>(payload: {
  items: T[]
  rowFields: IPivotTransformRowField<T>[]
  columnFields: IPivotTransformColumnField<T>[]
  valueFields: IPivotTransformValueField<T>[]
}): IPivotAggregationIndex {
  const { items, rowFields, columnFields, valueFields } = payload
  const accumulators: IPivotAccumulatorIndex = new Map()
  const rowPathsByDepth = rowFields.map(() => new Set<string>())

  for (const item of items) {
    const fullRowPath = rowFields.map(field => String(get(item, field.field) ?? ''))
    const fullColumnPath = columnFields.map(field => String(get(item, field.field) ?? ''))
    const rowPaths = rowFields.map((_, index) => ({
      path: fullRowPath.slice(0, index + 1),
      isGrandTotal: false,
    }))
    const columnPaths = (columnFields.length
      ? columnFields.map((_, index) => fullColumnPath.slice(0, index + 1))
      : [[]])
      .map(path => ({ path, isGrandTotal: false }))

    columnPaths.push({ path: [], isGrandTotal: true })

    rowPaths.forEach((entry, index) => rowPathsByDepth[index]!.add(getPivotPathId(entry.path)))
    rowPaths.push({ path: [], isGrandTotal: true })

    for (const valueField of valueFields) {
      const numericValue = getPivotRowValue(item, valueField)

      for (const rowPath of rowPaths) {
        for (const columnPath of columnPaths) {
          const accumulator = getOrCreateAccumulator({
            accumulators,
            rowKey: getAggregationPathKey(rowPath.path, rowPath.isGrandTotal),
            columnKey: getAggregationPathKey(columnPath.path, columnPath.isGrandTotal),
            measureId: valueField.measureId,
            summaryType: valueField.summaryType,
          })

          addToAccumulator(accumulator, numericValue)
        }
      }
    }
  }

  const values: IPivotAggregationIndex['values'] = new Map()

  for (const [rowKey, columnAccumulators] of accumulators) {
    const columnValues = new Map<string, Map<string, IPivotAggregatedValue>>()

    values.set(rowKey, columnValues)

    for (const [columnKey, measureAccumulators] of columnAccumulators) {
      const measureValues = new Map<string, IPivotAggregatedValue>()

      columnValues.set(columnKey, measureValues)

      for (const [measureId, accumulator] of measureAccumulators) {
        measureValues.set(measureId, {
          aggregated: finalizeAccumulator(accumulator),
          matchCount: accumulator.count,
        })
      }
    }
  }

  return {
    values,
    rowPathCountByDepth: rowPathsByDepth.map(paths => paths.size),
  }
}

export function getPivotAggregatedValue(payload: {
  index: IPivotAggregationIndex
  rowPath: string[]
  columnPath: string[]
  measureId: string
  rowGrandTotal?: boolean
  columnGrandTotal?: boolean
}): IPivotAggregatedValue {
  const rowValues = payload.index.values.get(
    getAggregationPathKey(payload.rowPath, payload.rowGrandTotal),
  )
  const columnValues = rowValues?.get(
    getAggregationPathKey(payload.columnPath, payload.columnGrandTotal),
  )

  return columnValues?.get(payload.measureId) ?? {
    aggregated: 0,
    matchCount: 0,
  }
}

// Types
import type {
  IPivotTransformColumnField,
  IPivotTransformRowField,
  IPivotTransformValueField,
} from './pivot-transform-data-core'
import type { IPivotColumnTreeNode } from './pivot-column-collapse'
import type { IPivotGroupKeyComparator, IPivotGroupKeyResolver } from './pivot-group-key'

// Functions
import {
  createPivotFieldReader,
  createPivotGroupKeyResolver,
  getPivotGroupKeyComparator,
} from './pivot-group-key'

type IPivotGroupField<T extends IItem> = Pick<IPivotTransformColumnField<T>, 'field' | 'dataType'>

/**
 * One distinct group path; the root node (id 0, empty path) is the grand total
 */
export type IPivotPathNode = {
  id: number
  depth: number
  key: string
  path: string[]
  /** First source item of the group */
  ref: unknown
  children: IPivotPathNode[]
  childByKey: Map<string, IPivotPathNode>
}

type IPivotPathTrie<T> = {
  root: IPivotPathNode
  nodeCount: number
  nodeCountByDepth: number[]
  keyResolvers: IPivotGroupKeyResolver<T>[]
  comparators: IPivotGroupKeyComparator[]
}

type IPivotCellAccumulator = {
  /** `[sum, count]` pairs per measure; finalized in place to `[aggregated, count]` */
  stats: Float64Array
  samples?: number[][]
}

export type IPivotAggregationIndex = {
  rowRoot: IPivotPathNode
  columnRoot: IPivotPathNode
  measureIndexById: Map<string, number>
  values: Map<number, Float64Array>
  rowPathCountByDepth: number[]
}

// Cell keys combine row and column node ids into one number (row ids stay below 2^27)
const COLUMN_NODE_ID_LIMIT = 2 ** 26

function createPathNode(payload: {
  id: number
  depth: number
  key: string
  path: string[]
  ref: unknown
}): IPivotPathNode {
  return {
    ...payload,
    children: [],
    childByKey: new Map(),
  }
}

function createPathTrie<T extends IItem>(fields: IPivotGroupField<T>[], locale?: string): IPivotPathTrie<T> {
  return {
    root: createPathNode({ id: 0, depth: 0, key: '', path: [], ref: undefined }),
    nodeCount: 1,
    nodeCountByDepth: fields.map(() => 0),
    keyResolvers: fields.map(field => createPivotGroupKeyResolver<T>(field.field, field.dataType)),
    comparators: fields.map(field => getPivotGroupKeyComparator(field.dataType, locale)),
  }
}

function getOrCreateChildNode<T>(trie: IPivotPathTrie<T>, parent: IPivotPathNode, key: string, item: T) {
  let node = parent.childByKey.get(key)

  if (!node) {
    node = createPathNode({
      id: trie.nodeCount++,
      depth: parent.depth + 1,
      key,
      path: [...parent.path, key],
      ref: item,
    })
    parent.childByKey.set(key, node)
    parent.children.push(node)
    trie.nodeCountByDepth[parent.depth]! += 1
  }

  return node
}

/**
 * Inserts the item's path and writes the node id of every depth (root first) into `nodeIds`
 */
function insertItemPath<T>(trie: IPivotPathTrie<T>, item: T, nodeIds: number[]) {
  let node = trie.root

  node.ref ??= item
  nodeIds[0] = node.id

  for (let level = 0; level < trie.keyResolvers.length; level++) {
    node = getOrCreateChildNode(trie, node, trie.keyResolvers[level]!(item), item)
    nodeIds[level + 1] = node.id
  }
}

function sortPathTrie<T>(trie: IPivotPathTrie<T>, node = trie.root) {
  if (!node.children.length) {
    return
  }

  const comparator = trie.comparators[node.depth]!

  node.children.sort((a, b) => comparator(a.key, b.key))
  node.children.forEach(child => sortPathTrie(trie, child))
}

export function buildPivotPathTrie<T extends IItem>(payload: {
  items: T[]
  fields: IPivotGroupField<T>[]
  locale?: string
}) {
  const trie = createPathTrie(payload.fields, payload.locale)
  const nodeIds: number[] = []

  for (const item of payload.items) {
    insertItemPath(trie, item, nodeIds)
  }

  sortPathTrie(trie)

  return trie.root
}

export function toPivotColumnTree(root: IPivotPathNode): IPivotColumnTreeNode[] {
  return root.children.map(node => ({
    key: node.key,
    path: node.path,
    children: toPivotColumnTree(node),
  }))
}

export function findPivotPathNode(root: IPivotPathNode, path: string[]) {
  let node: IPivotPathNode | undefined = root

  for (const key of path) {
    node = node.childByKey.get(key)

    if (!node) {
      return
    }
  }

  return node
}

function createValueReader<T extends IItem>(valueField: IPivotTransformValueField<T>) {
  const { summaryFormat } = valueField

  if (summaryFormat) {
    return (item: T) => {
      const formatted = summaryFormat(item)

      return typeof formatted === 'number' ? formatted : 0
    }
  }

  const read = createPivotFieldReader<T>(valueField.field)

  return (item: T) => {
    const raw = read(item)

    return typeof raw === 'number' ? raw : 0
  }
}

function getMedian(samples: number[]) {
  const values = samples.toSorted((a, b) => a - b)
  const middle = Math.floor(values.length / 2)

  if (values.length % 2 === 0) {
    return ((values[middle - 1] ?? 0) + (values[middle] ?? 0)) / 2
  }

  return values[middle] ?? 0
}

function finalizeAggregate(payload: {
  summaryType: SummaryEnum
  sum: number
  count: number
  samples?: number[]
}) {
  const { summaryType, sum, count, samples } = payload

  switch (summaryType) {
    case SummaryEnum.COUNT:
      return count

    case SummaryEnum.SUM:
      return sum

    case SummaryEnum.AVERAGE:
      return count ? sum / count : 0

    case SummaryEnum.MEDIAN:
      return getMedian(samples ?? [])

    default:
      return count
  }
}

export function buildPivotAggregationIndex<T extends IItem>(payload: {
  items: T[]
  rowFields: IPivotTransformRowField<T>[]
  columnFields: IPivotTransformColumnField<T>[]
  valueFields: IPivotTransformValueField<T>[]
  /** Text group keys sort by this locale's rules */
  locale?: string
}): IPivotAggregationIndex {
  const { items, rowFields, columnFields, valueFields, locale } = payload
  const rowTrie = createPathTrie<T>(rowFields, locale)
  const columnTrie = createPathTrie<T>(columnFields, locale)
  const valueReaders = valueFields.map(createValueReader)
  const measureCount = valueFields.length
  const medianMeasureIndexes = valueFields.flatMap((valueField, index) => {
    return valueField.summaryType === SummaryEnum.MEDIAN ? [index] : []
  })
  const accumulators = new Map<number, IPivotCellAccumulator>()
  const measureValues = new Float64Array(measureCount)
  const rowNodeIds: number[] = []
  const columnNodeIds: number[] = []

  for (const item of items) {
    insertItemPath(rowTrie, item, rowNodeIds)
    insertItemPath(columnTrie, item, columnNodeIds)

    for (let measure = 0; measure < measureCount; measure++) {
      measureValues[measure] = valueReaders[measure]!(item)
    }

    for (const rowNodeId of rowNodeIds) {
      for (const columnNodeId of columnNodeIds) {
        const cellKey = rowNodeId * COLUMN_NODE_ID_LIMIT + columnNodeId
        let accumulator = accumulators.get(cellKey)

        if (!accumulator) {
          accumulator = {
            stats: new Float64Array(measureCount * 2),
            samples: medianMeasureIndexes.length
              ? Array.from({ length: measureCount }, () => [])
              : undefined,
          }
          accumulators.set(cellKey, accumulator)
        }

        const { stats, samples } = accumulator

        for (let measure = 0; measure < measureCount; measure++) {
          stats[measure * 2] = stats[measure * 2]! + measureValues[measure]!
          stats[measure * 2 + 1] = stats[measure * 2 + 1]! + 1
        }

        for (const measure of medianMeasureIndexes) {
          samples![measure]!.push(measureValues[measure]!)
        }
      }
    }
  }

  if (columnTrie.nodeCount > COLUMN_NODE_ID_LIMIT) {
    throw new Error(`Pivot supports at most ${COLUMN_NODE_ID_LIMIT} column groups.`)
  }

  sortPathTrie(rowTrie)
  sortPathTrie(columnTrie)

  const values = new Map<number, Float64Array>()

  for (const [cellKey, { stats, samples }] of accumulators) {
    for (let measure = 0; measure < measureCount; measure++) {
      stats[measure * 2] = finalizeAggregate({
        summaryType: valueFields[measure]!.summaryType,
        sum: stats[measure * 2]!,
        count: stats[measure * 2 + 1]!,
        samples: samples?.[measure],
      })
    }

    values.set(cellKey, stats)
  }

  return {
    rowRoot: rowTrie.root,
    columnRoot: columnTrie.root,
    measureIndexById: new Map(valueFields.map((valueField, index) => [valueField.measureId, index])),
    values,
    rowPathCountByDepth: rowTrie.nodeCountByDepth,
  }
}

/**
 * `[aggregated, matchCount]` pairs per measure (`index.measureIndexById`) of one row x column group intersection,
 * or `undefined` when no item falls into it
 */
export function getPivotAggregatedStats(
  index: IPivotAggregationIndex,
  rowNodeId: number,
  columnNodeId?: number,
) {
  if (columnNodeId === undefined) {
    return
  }

  return index.values.get(rowNodeId * COLUMN_NODE_ID_LIMIT + columnNodeId)
}

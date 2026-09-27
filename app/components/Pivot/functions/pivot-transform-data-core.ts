// Types
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotRowItem, PivotRowItemKind } from '../types/pivot-row-item.type'
import type { IPivotRowItemCell, PivotRowItemCellKind } from '../types/pivot-row-item-cell.type'
import type { IPivotValueItem } from '../types/pivot-value-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'
import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'

// Functions
import { getPivotGroupId } from './pivot-group-collapse'
import { buildPivotValueColumns } from './pivot-build-value-columns'
import {
  buildPivotAggregationIndex,
  findPivotPathNode,
  getPivotAggregatedStats,
  toPivotColumnTree,
} from './pivot-aggregate-values'
import type { IPivotAggregationIndex, IPivotPathNode } from './pivot-aggregate-values'
import type { IPivotColumnTreeNode } from './pivot-column-collapse'
import { getPivotPathId } from './pivot-path-id'
import { applyPivotSerializedFilters } from './pivot-filter-serialized-data'
import type { IPivotTransformWorkerFilter } from './pivot-transform-worker-payload'

// Models
import type { PivotItem } from '../models/pivot-item.model'

export type IPivotTransformRowField<T extends IItem = IItem> = Pick<
  PivotItem<T>,
  'field' | 'dataType' | 'minWidth' | 'width' | 'widthResolved' | 'resizable'
>

export type IPivotTransformColumnField<T extends IItem = IItem> = Pick<
  PivotItem<T>,
  'field'
> & {
  dataType?: PivotItem<T>['dataType']
}

export type IPivotTransformValueField<T extends IItem = IItem> = {
  measureId: string
  field: ObjectKey<T>
  summaryType: SummaryEnum
  summaryFormat?: (row: T) => number
  widthResolved: string
  _label: string
  item?: PivotItem<T>
}

export type IPivotTransformCorePayload<T extends IItem = IItem> = {
  data: T[]
  rows: IPivotTransformRowField<T>[]
  columns: IPivotTransformColumnField<T>[]
  values: IPivotTransformValueField<T>[]
  items?: PivotItem<T>[]
  filters?: IPivotTransformWorkerFilter<T>[]
  locale?: string
  /** Translated grand total label for the value columns and headers the transform builds */
  grandTotalLabel?: string
  valuesOnRows?: boolean
  transliterate?: boolean
  sourceRowCount?: number
}

type IPivotAggregatedValueContext<T extends IItem> = {
  aggregationIndex: IPivotAggregationIndex
  valueColumns: IPivotValueColumnItem<T>[]
  /** Column node id of each value column, aligned with `valueColumns` */
  valueColumnNodeIds: (number | undefined)[]
  valueFields: IPivotTransformValueField<T>[]
  columnGroupNodes: IPivotPathNode[]
  /** Every built value item, filled with its values once all rows exist */
  valueSlots: IPivotValueSlot[]
}

type IPivotValueSlot = {
  item: IPivotValueItem
  rowNodeId: number
  activeMeasureId?: string
}

type IBuildRowCellsPayload<T extends IItem> = {
  rowFields: IPivotTransformRowField<T>[]
  cellKinds: PivotRowItemCellKind[]
  itemId: string
  refItem: T
  groupPath: string[]
}

type IBuildValueItemPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  itemId: string
  kind: PivotRowItemKind
  groupIds: string[]
  rowNodeId: number
  activeMeasureId?: string
}

type IBuildDataItemPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  node: IPivotPathNode
  path: string[]
  rowFields: IPivotTransformRowField<T>[]
  cellKinds: PivotRowItemCellKind[]
  kind?: PivotRowItemKind
}

type IBuildTabularRowsPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  parentNode: IPivotPathNode
  rowFields: IPivotTransformRowField<T>[]
  valuesOnRows?: boolean
}

function shouldExpandMeasuresOnRows<T extends IItem>(payload: {
  valuesOnRows?: boolean
  valueFields: IPivotTransformValueField<T>[]
}) {
  return !!payload.valuesOnRows && payload.valueFields.length > 1
}

function buildRowCells<T extends IItem>(payload: IBuildRowCellsPayload<T>): IPivotRowItemCell<T>[] {
  const { rowFields, cellKinds, itemId, refItem, groupPath } = payload

  return rowFields.map((rowField, index) => {
    return {
      id: `${itemId}-cell-${index}`,
      kind: cellKinds[index] ?? 'empty',
      rowFieldIndex: index,
      row: rowField as PivotItem<T>,
      groupId: getPivotGroupId(groupPath, index),
      ref: refItem,
    }
  })
}

function buildValueItem<T extends IItem>(payload: IBuildValueItemPayload<T>): IPivotValueItem<T> {
  const { itemId, kind, groupIds, rowNodeId, activeMeasureId, valueSlots } = payload
  const item: IPivotValueItem<T> = { id: itemId, kind, groupIds }

  valueSlots.push({ item, rowNodeId, activeMeasureId })

  return item
}

/**
 * Fills every value item with views into one buffer per matrix (values, flags, column group values and flags),
 * so a worker transfers four buffers instead of copying a cell object per value
 */
function fillPivotValueMatrices<T extends IItem>(context: IPivotAggregatedValueContext<T>) {
  const { aggregationIndex, valueColumns, valueColumnNodeIds, valueFields, columnGroupNodes, valueSlots } = context
  const { measureIndexById } = aggregationIndex
  const columnCount = valueColumns.length
  const measureCount = valueFields.length
  const groupWidth = columnGroupNodes.length * measureCount
  const values = new Float64Array(valueSlots.length * columnCount)
  const hasValues = new Uint8Array(valueSlots.length * columnCount)
  const groupValues = new Float64Array(valueSlots.length * groupWidth)
  const groupHasValues = new Uint8Array(valueSlots.length * groupWidth)
  const columnMeasures = valueColumns.map(column => measureIndexById.get(column.measureId) ?? -1)

  valueSlots.forEach(({ item, rowNodeId, activeMeasureId }, rowIndex) => {
    const activeMeasure = activeMeasureId === undefined ? undefined : measureIndexById.get(activeMeasureId) ?? -1
    // A cell shows its aggregate only where items fall into it, on total rows too (a total that sums to 0 stays 0)
    const offset = rowIndex * columnCount
    const groupOffset = rowIndex * groupWidth

    for (let column = 0; column < columnCount; column++) {
      const measure = activeMeasure ?? columnMeasures[column]!
      const stats = measure < 0 ? undefined : getPivotAggregatedStats(aggregationIndex, rowNodeId, valueColumnNodeIds[column])

      values[offset + column] = stats?.[measure * 2] ?? 0
      hasValues[offset + column] = (stats?.[measure * 2 + 1] ?? 0) > 0 ? 1 : 0
    }

    columnGroupNodes.forEach((columnNode, group) => {
      const stats = getPivotAggregatedStats(aggregationIndex, rowNodeId, columnNode.id)

      for (let measure = 0; measure < measureCount; measure++) {
        const index = groupOffset + group * measureCount + measure

        groupValues[index] = stats?.[measure * 2] ?? 0
        groupHasValues[index] = (stats?.[measure * 2 + 1] ?? 0) > 0 ? 1 : 0
      }
    })

    item.values = values.subarray(offset, offset + columnCount)
    item.hasValues = hasValues.subarray(offset, offset + columnCount)
    item.columnGroupValues = groupValues.subarray(groupOffset, groupOffset + groupWidth)
    item.columnGroupHasValues = groupHasValues.subarray(groupOffset, groupOffset + groupWidth)
  })
}

function getPivotColumnGroupKeys<T extends IItem>(payload: {
  columnGroupNodes: IPivotPathNode[]
  valueFields: IPivotTransformValueField<T>[]
}) {
  return payload.columnGroupNodes.flatMap(node => {
    const pathId = getPivotPathId(node.path)

    return payload.valueFields.map(valueField => `${pathId}:${valueField.measureId}`)
  })
}

/** The buffers behind a result's value matrices, for `postMessage(result, transfer)` */
export function getPivotTransformTransferables<T>(result: IPivotTransformResult<T>) {
  const buffers = new Set<ArrayBuffer>()

  for (const row of result.data) {
    const { values, hasValues, columnGroupValues, columnGroupHasValues } = row.valueItem

    for (const view of [values, hasValues, columnGroupValues, columnGroupHasValues]) {
      if (view) {
        buffers.add(view.buffer as ArrayBuffer)
      }
    }
  }

  return [...buffers]
}

function expandDataItemByMeasures<T extends IItem>(
  item: IPivotDataItem<T>,
  rowNodeId: number,
  valueFields: IPivotTransformValueField<T>[],
  valueContext: IPivotAggregatedValueContext<T>,
): IPivotDataItem<T>[] {
  // The per-measure rows replace the item, so its value item (the slot pushed last) never gets a matrix row
  if (valueContext.valueSlots.at(-1)?.item === item.valueItem) {
    valueContext.valueSlots.pop()
  }

  return valueFields.map((valueField, measureIndex) => {
    const isFirst = measureIndex === 0
    const itemId = `${item.id}:${valueField.measureId}`

    const cells = item.rowItem.cells.map(cell => ({
      ...cell,
      id: `${itemId}-cell-${cell.rowFieldIndex}`,
      kind: isFirst ? cell.kind : 'empty' as PivotRowItemCellKind,
    }))

    cells.push({
      id: `${itemId}-measure-label`,
      kind: 'valueLabel',
      rowFieldIndex: cells.length,
      groupId: item.groupIds.at(-1) ?? item.id,
      ref: item.rowItem.cells[0]!.ref,
      label: valueField._label,
    })

    return {
      ...item,
      id: itemId,
      activeValueField: valueField.field,
      activeMeasureId: valueField.measureId,
      measureIndex,
      measureCount: valueFields.length,
      rowItem: {
        ...item.rowItem,
        id: itemId,
        cells,
      },
      valueItem: buildValueItem({
        itemId,
        kind: item.rowItem.kind ?? 'data',
        groupIds: item.groupIds,
        rowNodeId,
        activeMeasureId: valueField.measureId,
        ...valueContext,
      }),
    }
  })
}

type IExpandMeasuresPayload<T extends IItem> = {
  valuesOnRows?: boolean
  valueFields: IPivotTransformValueField<T>[]
  valueContext: IPivotAggregatedValueContext<T>
}

function pushDataItems<T extends IItem>(
  results: IPivotDataItem<T>[],
  item: IPivotDataItem<T>,
  rowNodeId: number,
  payload: IExpandMeasuresPayload<T>,
) {
  if (shouldExpandMeasuresOnRows(payload)) {
    results.push(...expandDataItemByMeasures(
      item,
      rowNodeId,
      payload.valueFields,
      payload.valueContext,
    ))

    return
  }

  results.push(item)
}

function buildDataItem<T extends IItem>(payload: IBuildDataItemPayload<T>): IPivotDataItem<T> {
  const {
    path,
    rowFields,
    cellKinds,
    kind = 'data',
    node,
    ...valueContext
  } = payload

  const pathId = getPivotPathId(path)
  const refItem = node.ref as T
  const itemId = kind === 'data' ? pathId : `${kind}:${pathId}`
  const groupPath = kind === 'grandTotal'
    ? []
    : kind === 'subtotal'
      ? path.slice(0, -1)
      : path
  const label = groupPath.join(' / ')
  const groupIds = groupPath.map((_, index) => getPivotGroupId(groupPath, index))

  const rowItem: IPivotRowItem<T> = {
    id: itemId,
    label,
    kind,
    cells: buildRowCells({ rowFields, cellKinds, itemId, refItem, groupPath }),
  }

  const valueItem = buildValueItem({
    itemId,
    kind,
    groupIds,
    rowNodeId: node.id,
    ...valueContext,
  })

  return {
    id: itemId,
    label,
    groupPath,
    groupIds,
    rowItem,
    valueItem,
  }
}

function buildTabularRows<T extends IItem>(payload: IBuildTabularRowsPayload<T>): IPivotDataItem<T>[] {
  const {
    parentNode,
    rowFields,
    valuesOnRows,
    ...valueContext
  } = payload

  if (!rowFields.length) {
    return []
  }

  const expandPayload = {
    valuesOnRows,
    valueFields: valueContext.valueFields,
    valueContext,
  }

  const level = parentNode.depth
  const results: IPivotDataItem<T>[] = []

  for (const node of parentNode.children) {
    const currentPath = node.path

    if (level < rowFields.length - 1) {
      const groupHeaderCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      pushDataItems(results, buildDataItem({
        path: currentPath,
        rowFields,
        cellKinds: groupHeaderCellKinds,
        node,
        ...valueContext,
      }), node.id, expandPayload)

      const childRows = buildTabularRows({
        parentNode: node,
        rowFields,
        valuesOnRows,
        ...valueContext,
      })

      childRows.forEach(row => {
        if (row.rowItem.kind !== 'data') {
          return
        }

        const labelCell = row.rowItem.cells.find(cell => cell.rowFieldIndex === level)

        if (labelCell) {
          labelCell.kind = 'empty'
        }
      })

      results.push(...childRows)

      const subtotalCellKinds = rowFields.map((_, index) =>
        index === level ? 'subtotal' as const : 'empty' as const,
      )

      pushDataItems(results, buildDataItem({
        path: [...currentPath, '__subtotal__'],
        rowFields,
        cellKinds: subtotalCellKinds,
        node,
        kind: 'subtotal',
        ...valueContext,
      }), node.id, expandPayload)
    } else {
      const rowCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      pushDataItems(results, buildDataItem({
        path: currentPath,
        rowFields,
        cellKinds: rowCellKinds,
        node,
        ...valueContext,
      }), node.id, expandPayload)
    }
  }

  return results
}

export type IPivotPreparedAggregation<T extends IItem = IItem> = {
  filteredData: T[]
  rowFields: IPivotTransformRowField<T>[]
  columnFields: IPivotTransformColumnField<T>[]
  valueFields: IPivotTransformValueField<T>[]
  aggregationIndex: IPivotAggregationIndex
  columnTree: IPivotColumnTreeNode[]
  columnGroupNodes: IPivotPathNode[]
  sourceRowCount: number
}

export type IPivotPreparedTransform<T extends IItem = IItem> = IPivotPreparedAggregation<T> & {
  valuesOnRows?: boolean
  valueColumns: IPivotValueColumnItem<T>[]
  valueHeaderRows: IPivotValueHeaderCell[][]
  estimate: IPivotTransformEstimate
}

export function preparePivotAggregationData<T extends IItem = IItem>(
  payload: IPivotTransformCorePayload<T>,
): IPivotPreparedAggregation<T> {
  const {
    data: sourceData,
    rows: rowFields,
    columns: columnFields,
    values: valueFields,
    filters = [],
    transliterate,
    locale,
    sourceRowCount = sourceData.length,
  } = payload

  const filteredData = filters.length
    ? applyPivotSerializedFilters(sourceData, filters, { transliterate })
    : sourceData
  const aggregationIndex = buildPivotAggregationIndex({
    items: filteredData,
    rowFields,
    columnFields,
    valueFields,
    locale,
  })
  const columnTree = toPivotColumnTree(aggregationIndex.columnRoot)
  const columnGroupNodes: IPivotPathNode[] = []

  function collectColumnGroupNodes(nodes: IPivotPathNode[]) {
    for (const node of nodes) {
      if (node.children.length) {
        columnGroupNodes.push(node)
        collectColumnGroupNodes(node.children)
      }
    }
  }

  collectColumnGroupNodes(aggregationIndex.columnRoot.children)

  return {
    filteredData,
    rowFields,
    columnFields,
    valueFields,
    aggregationIndex,
    columnTree,
    columnGroupNodes,
    sourceRowCount,
  }
}

export function projectPivotPreparedAggregation<T extends IItem = IItem>(
  prepared: IPivotPreparedAggregation<T>,
  projection?: {
    rows?: IPivotTransformRowField<T>[]
    columns?: IPivotTransformColumnField<T>[]
    values?: IPivotTransformValueField<T>[]
    valuesOnRows?: boolean
    grandTotalLabel?: string
  },
): IPivotPreparedTransform<T> {
  const rowFields = projection?.rows ?? prepared.rowFields
  const columnFields = projection?.columns ?? prepared.columnFields
  const valueFields = projection?.values ?? prepared.valueFields
  const valuesOnRows = projection?.valuesOnRows
  const { valueColumns, valueHeaderRows } = buildPivotValueColumns({
    data: prepared.filteredData,
    columnFields,
    valueFields,
    columnTree: prepared.columnTree,
    valuesOnRows,
    grandTotalLabel: projection?.grandTotalLabel,
  })
  const rowCounts = prepared.aggregationIndex.rowPathCountByDepth
  const baseRowCount = !prepared.filteredData.length || !rowFields.length
    ? 0
    : (rowCounts.at(-1) ?? 0)
      + rowCounts.slice(0, -1).reduce((sum, count) => sum + count * 2, 0)
      + 1
  const projectedRowCount = shouldExpandMeasuresOnRows({ valuesOnRows, valueFields })
    ? baseRowCount * valueFields.length
    : baseRowCount
  const groupMeasureCount = shouldExpandMeasuresOnRows({ valuesOnRows, valueFields })
    ? 1
    : valueFields.length
  const estimate = {
    sourceRowCount: prepared.sourceRowCount,
    projectedRowCount,
    valueColumnCount: valueColumns.length,
    logicalCellCount: projectedRowCount
      * (valueColumns.length + prepared.columnGroupNodes.length * groupMeasureCount),
  }

  return {
    ...prepared,
    rowFields,
    columnFields,
    valueFields,
    valuesOnRows,
    valueColumns,
    valueHeaderRows,
    estimate,
  }
}

export function preparePivotTransformData<T extends IItem = IItem>(
  payload: IPivotTransformCorePayload<T>,
): IPivotPreparedTransform<T> {
  const prepared = preparePivotAggregationData(payload)

  return projectPivotPreparedAggregation(prepared, {
    rows: payload.rows,
    columns: payload.columns,
    values: payload.values,
    valuesOnRows: payload.valuesOnRows,
    grandTotalLabel: payload.grandTotalLabel,
  })
}

export function materializePivotTransformData<T extends IItem = IItem>(
  prepared: IPivotPreparedTransform<T>,
): IPivotTransformResult<T> {
  const {
    filteredData,
    rowFields,
    valueFields,
    valuesOnRows,
    aggregationIndex,
    valueColumns,
    valueHeaderRows,
    columnTree,
    columnGroupNodes,
    estimate,
  } = prepared
  const columnGroupKeys = getPivotColumnGroupKeys({ columnGroupNodes, valueFields })

  if (!filteredData.length || !rowFields.length) {
    return {
      data: [],
      valueColumns,
      valueHeaderRows,
      columnTree,
      columnGroupKeys,
      estimate,
    }
  }

  const { rowRoot, columnRoot } = aggregationIndex
  const valueContext: IPivotAggregatedValueContext<T> = {
    aggregationIndex,
    valueColumns,
    valueColumnNodeIds: valueColumns.map(column => {
      return column.isGrandTotal
        ? columnRoot.id
        : findPivotPathNode(columnRoot, column.columnPath)?.id
    }),
    valueFields,
    columnGroupNodes,
    valueSlots: [],
  }

  const expandPayload = {
    valuesOnRows,
    valueFields,
    valueContext,
  }

  const tabularRows = buildTabularRows({
    parentNode: rowRoot,
    rowFields,
    valuesOnRows,
    ...valueContext,
  })

  const grandTotalCellKinds = rowFields.map((_, index) =>
    index === 0 ? 'grandTotal' as const : 'empty' as const,
  )

  pushDataItems(tabularRows, buildDataItem({
    path: ['__grand_total__'],
    rowFields,
    cellKinds: grandTotalCellKinds,
    node: rowRoot,
    kind: 'grandTotal',
    ...valueContext,
  }), rowRoot.id, expandPayload)

  fillPivotValueMatrices(valueContext)

  return {
    data: tabularRows,
    valueColumns,
    valueHeaderRows,
    columnTree,
    columnGroupKeys,
    estimate,
  }
}

export function pivotTransformDataCore<T extends IItem = IItem>(
  payload: IPivotTransformCorePayload<T>,
) {
  return materializePivotTransformData(preparePivotTransformData(payload))
}

export function rehydratePivotTransformResult<T extends IItem>(
  result: IPivotTransformResult<T>,
  payload: {
    rows: PivotItem<T>[]
    values: IPivotTransformValueField<T>[]
  },
): IPivotTransformResult<T> {
  const rowByField = new Map(payload.rows.map(row => [String(row.field), row]))
  const valueByMeasureId = new Map(payload.values.map(value => [value.measureId, value.item]))

  const rehydrateValueField = (measureId: string, field: ObjectKey<T>) => {
    return valueByMeasureId.get(measureId) ?? field
  }

  const rehydrateRowField = (field?: ObjectKey<T> | PivotItem<T>) => {
    const key = typeof field === 'object' && field !== null && 'field' in field
      ? String(field.field)
      : String(field)

    return rowByField.get(key) ?? field
  }

  for (const column of result.valueColumns) {
    column.value = rehydrateValueField(column.measureId, column.valueField) as PivotItem<T>
  }

  // Value cells are built on the main thread from the store's value fields, so only row cells need their items
  for (const item of result.data) {
    for (const cell of item.rowItem.cells) {
      cell.row = rehydrateRowField(cell.row) as PivotItem<T>
    }
  }

  return result
}

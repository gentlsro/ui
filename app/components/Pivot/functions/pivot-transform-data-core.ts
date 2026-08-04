// Types
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotRowItem, PivotRowItemKind } from '../types/pivot-row-item.type'
import type { IPivotRowItemCell, PivotRowItemCellKind } from '../types/pivot-row-item-cell.type'
import type { IPivotValueItem } from '../types/pivot-value-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'
import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'

// Functions
import { getPivotGroupId, getPivotStickyIndices } from './pivot-group-collapse'
import {
  buildPivotColumnTree,
  buildPivotValueColumns,
} from './pivot-build-value-columns'
import { pivotGroupBy } from './pivot-group-by'
import {
  buildPivotAggregationIndex,
  getPivotAggregatedValue,
} from './pivot-aggregate-values'
import type { IPivotAggregationIndex } from './pivot-aggregate-values'
import type { IPivotColumnTreeNode } from './pivot-column-collapse'
import { getPivotPathId } from './pivot-path-id'
import { applyPivotSerializedFilters } from './pivot-filter-serialized-data'
import type { IPivotTransformWorkerFilter } from './pivot-transform-worker-payload'

// Models
import type { PivotItem } from '../models/pivot-item.model'

type IPivotFormatNumber = (value: number) => string

export type IPivotTransformRowField<T extends IItem = IItem> = Pick<
  PivotItem<T>,
  'field' | 'dataType' | 'minWidth' | 'width' | 'widthResolved' | 'resizable'
>

export type IPivotTransformColumnField<T extends IItem = IItem> = Pick<
  PivotItem<T>,
  'field'
>

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
  formatNumber?: IPivotFormatNumber
  locale?: string
  valuesOnRows?: boolean
  transliterate?: boolean
  sourceRowCount?: number
}

type IPivotAggregatedValueContext<T extends IItem> = {
  aggregationIndex: IPivotAggregationIndex
  valueColumns: IPivotValueColumnItem<T>[]
  valueFields: IPivotTransformValueField<T>[]
  columnGroupPaths: string[][]
}

type IBuildRowCellsPayload<T extends IItem> = {
  rowFields: IPivotTransformRowField<T>[]
  cellKinds: PivotRowItemCellKind[]
  itemId: string
  refItem: T
  groupPath: string[]
}

type IBuildValueCellsPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  itemId: string
  kind: PivotRowItemKind
  rowPath: string[]
  activeValueField?: ObjectKey<T>
  activeMeasureId?: string
}

type IBuildValueItemPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  itemId: string
  kind: PivotRowItemKind
  groupIds: string[]
  rowPath: string[]
  activeValueField?: ObjectKey<T>
  activeMeasureId?: string
}

type IBuildDataItemPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  items: T[]
  path: string[]
  rowFields: IPivotTransformRowField<T>[]
  cellKinds: PivotRowItemCellKind[]
  kind?: PivotRowItemKind
}

type IBuildTabularRowsPayload<T extends IItem> = IPivotAggregatedValueContext<T> & {
  items: T[]
  rowFields: IPivotTransformRowField<T>[]
  level?: number
  parentPath?: string[]
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

function buildValueCells<T extends IItem>(payload: IBuildValueCellsPayload<T>): IPivotValueItemCell<T>[] {
  const {
    itemId,
    kind,
    rowPath,
    valueColumns,
    valueFields,
    aggregationIndex,
    activeValueField,
    activeMeasureId,
  } = payload

  return valueColumns.map((column, index) => {
    const measureId = activeMeasureId ?? column.measureId
    const { aggregated, matchCount } = getPivotAggregatedValue({
      index: aggregationIndex,
      rowPath,
      columnPath: column.columnPath,
      measureId,
      rowGrandTotal: kind === 'grandTotal',
      columnGrandTotal: column.isGrandTotal,
    })
    const showValue = matchCount > 0 || kind !== 'data'
    const valueFieldMeta = valueFields.find(field => field.measureId === measureId)
    const fieldForAggregation = activeValueField ?? valueFieldMeta?.field ?? column.valueField

    return {
      id: `${itemId}-value-${index}`,
      kind,
      columnId: column.id,
      columnPath: column.columnPath,
      measureId,
      valueField: fieldForAggregation,
      value: valueFieldMeta?.item ?? { field: fieldForAggregation } as PivotItem<T>,
      aggregated,
      hasValue: showValue,
    }
  })
}

function buildValueItem<T extends IItem>(payload: IBuildValueItemPayload<T>): IPivotValueItem<T> {
  const { itemId, kind, groupIds, ...valueContext } = payload
  const valueFields = valueContext.activeMeasureId
    ? valueContext.valueFields.filter(field => field.measureId === valueContext.activeMeasureId)
    : valueContext.valueFields
  const columnGroupCells: Record<string, IPivotValueItemCell<T>> = {}

  for (const columnPath of valueContext.columnGroupPaths) {
    for (const valueField of valueFields) {
      const { aggregated, matchCount } = getPivotAggregatedValue({
        index: valueContext.aggregationIndex,
        rowPath: valueContext.rowPath,
        columnPath,
        measureId: valueField.measureId,
        rowGrandTotal: kind === 'grandTotal',
      })
      const key = `${getPivotPathId(columnPath)}:${valueField.measureId}`

      columnGroupCells[key] = {
        id: `${itemId}-column-group-${key}`,
        kind,
        columnId: `collapsed:${key}`,
        columnPath,
        measureId: valueField.measureId,
        valueField: valueField.field,
        value: valueField.item ?? { field: valueField.field } as PivotItem<T>,
        aggregated,
        hasValue: matchCount > 0 || kind !== 'data',
      }
    }
  }

  return {
    id: itemId,
    kind,
    groupIds,
    cells: buildValueCells({ itemId, kind, ...valueContext }),
    columnGroupCells,
  }
}

function expandDataItemByMeasures<T extends IItem>(
  item: IPivotDataItem<T>,
  valueFields: IPivotTransformValueField<T>[],
  valueContext: IPivotAggregatedValueContext<T>,
): IPivotDataItem<T>[] {
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
        rowPath: item.rowItem.kind === 'grandTotal'
          ? ['__grand_total__']
          : item.groupPath,
        activeValueField: valueField.field,
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
  payload: IExpandMeasuresPayload<T>,
) {
  if (shouldExpandMeasuresOnRows(payload)) {
    results.push(...expandDataItemByMeasures(
      item,
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
    items,
    ...valueContext
  } = payload

  const pathId = getPivotPathId(path)
  const refItem = items[0]!
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
    rowPath: kind === 'grandTotal' ? ['__grand_total__'] : groupPath,
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
    items,
    rowFields,
    level = 0,
    parentPath = [],
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

  const field = rowFields[level]!
  const groups = pivotGroupBy(items, field.field)
  const sortedKeys = [...groups.keys()].sort()
  const results: IPivotDataItem<T>[] = []

  for (const key of sortedKeys) {
    const groupItems = groups.get(key)!
    const currentPath = [...parentPath, key]

    if (level < rowFields.length - 1) {
      const groupHeaderCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      pushDataItems(results, buildDataItem({
        path: currentPath,
        rowFields,
        cellKinds: groupHeaderCellKinds,
        items: groupItems,
        ...valueContext,
      }), {
        ...expandPayload,
      })

      const childRows = buildTabularRows({
        items: groupItems,
        rowFields,
        level: level + 1,
        parentPath: currentPath,
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
        items: groupItems,
        kind: 'subtotal',
        ...valueContext,
      }), {
        ...expandPayload,
      })
    } else {
      const rowCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      pushDataItems(results, buildDataItem({
        path: currentPath,
        rowFields,
        cellKinds: rowCellKinds,
        items: groupItems,
        ...valueContext,
      }), {
        ...expandPayload,
      })
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
  columnGroupPaths: string[][]
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
  })
  const columnTree = buildPivotColumnTree({ items: filteredData, columnFields })
  const columnGroupPaths: string[][] = []

  function collectColumnGroupPaths(nodes: IPivotColumnTreeNode[]) {
    for (const node of nodes) {
      if (node.children.length) {
        columnGroupPaths.push(node.path)
        collectColumnGroupPaths(node.children)
      }
    }
  }

  collectColumnGroupPaths(columnTree)

  return {
    filteredData,
    rowFields,
    columnFields,
    valueFields,
    aggregationIndex,
    columnTree,
    columnGroupPaths,
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
      * (valueColumns.length + prepared.columnGroupPaths.length * groupMeasureCount),
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
    columnGroupPaths,
    estimate,
  } = prepared

  if (!filteredData.length || !rowFields.length) {
    return {
      data: [],
      valueColumns,
      valueHeaderRows,
      columnTree,
      stickyIndices: [],
      estimate,
    }
  }

  const valueContext = {
    aggregationIndex,
    valueColumns,
    valueFields,
    columnGroupPaths,
  }

  const expandPayload = {
    valuesOnRows,
    valueFields,
    valueContext,
  }

  const tabularRows = buildTabularRows({
    items: filteredData,
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
    items: filteredData,
    kind: 'grandTotal',
    ...valueContext,
  }), {
    ...expandPayload,
  })

  return {
    data: tabularRows,
    valueColumns,
    valueHeaderRows,
    columnTree,
    stickyIndices: getPivotStickyIndices(tabularRows, rowFields.length),
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

  for (const item of result.data) {
    for (const cell of item.rowItem.cells) {
      cell.row = rehydrateRowField(cell.row) as PivotItem<T>
    }

    for (const cell of item.valueItem.cells) {
      cell.value = rehydrateValueField(cell.measureId, cell.valueField) as PivotItem<T>
    }

    if (item.valueItem.columnGroupCells) {
      for (const cell of Object.values(item.valueItem.columnGroupCells)) {
        cell.value = rehydrateValueField(cell.measureId, cell.valueField) as PivotItem<T>
      }
    }

    if (item.valueItem.collapsedGroupValueItems) {
      for (const collapsedItem of Object.values(item.valueItem.collapsedGroupValueItems)) {
        for (const cell of collapsedItem.cells) {
          cell.value = rehydrateValueField(cell.measureId, cell.valueField) as PivotItem<T>
        }
      }
    }
  }

  return result
}

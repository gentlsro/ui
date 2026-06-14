// Types
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotRowItem, PivotRowItemKind } from '../types/pivot-row-item.type'
import type { IPivotRowItemCell, PivotRowItemCellKind } from '../types/pivot-row-item-cell.type'
import type { IPivotValueItem } from '../types/pivot-value-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'

// Functions
import { getPivotGroupId, getPivotStickyIndices } from './pivot-group-collapse'
import {
  buildPivotValueColumns,
  formatPivotValue,
} from './pivot-build-value-columns'
import { pivotGroupBy } from './pivot-group-by'
import {
  buildPivotAggregationIndex,
  getPivotAggregatedValue,
} from './pivot-aggregate-values'

// Models
import type { PivotRow } from '../models/pivot-row.model'
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

type IPivotFormatNumber = (value: number) => string

export type IPivotTransformCorePayload<T = IItem> = {
  data: T[]
  rows: PivotRow<T>[]
  columns: PivotColumn<T>[]
  values: PivotValue<T>[]
  formatNumber?: IPivotFormatNumber
  locale?: string
}

type IPivotAggregatedValueContext<T> = {
  items: T[]
  valueColumns: IPivotValueColumnItem<T>[]
  columnFields: PivotColumn<T>[]
  valueFields: PivotValue<T>[]
  formatNumber: IPivotFormatNumber
}

type IBuildRowCellsPayload<T> = {
  rowFields: PivotRow<T>[]
  cellKinds: PivotRowItemCellKind[]
  itemId: string
  refItem: T
  groupPath: string[]
}

type IBuildValueCellsPayload<T> = IPivotAggregatedValueContext<T> & {
  itemId: string
  kind: PivotRowItemKind
}

type IBuildValueItemPayload<T> = IPivotAggregatedValueContext<T> & {
  itemId: string
  kind: PivotRowItemKind
  groupIds: string[]
}

type ISetCollapsedGroupValueItemPayload<T> = IPivotAggregatedValueContext<T> & {
  row: IPivotDataItem<T>
  groupId: string
}

type IBuildDataItemPayload<T> = IPivotAggregatedValueContext<T> & {
  path: string[]
  rowFields: PivotRow<T>[]
  cellKinds: PivotRowItemCellKind[]
  kind?: PivotRowItemKind
}

type IBuildTabularRowsPayload<T> = IPivotAggregatedValueContext<T> & {
  rowFields: PivotRow<T>[]
  level?: number
  parentPath?: string[]
}

function resolveFormatNumber<T>(payload: IPivotTransformCorePayload<T>) {
  if (payload.formatNumber) {
    return payload.formatNumber
  }

  if (payload.locale) {
    const formatter = new Intl.NumberFormat(payload.locale)

    return (value: number) => formatter.format(value)
  }

  return (value: number) => String(value)
}

function buildRowCells<T>(payload: IBuildRowCellsPayload<T>): IPivotRowItemCell<T>[] {
  const { rowFields, cellKinds, itemId, refItem, groupPath } = payload

  return rowFields.map((rowField, index) => {
    return {
      id: `${itemId}-cell-${index}`,
      kind: cellKinds[index] ?? 'empty',
      rowFieldIndex: index,
      row: rowField,
      groupId: getPivotGroupId(groupPath, index),
      ref: refItem,
    }
  })
}

function buildValueCells<T>(payload: IBuildValueCellsPayload<T>): IPivotValueItemCell<T>[] {
  const {
    items,
    itemId,
    kind,
    valueColumns,
    columnFields,
    valueFields,
    formatNumber,
  } = payload
  const aggregationIndex = buildPivotAggregationIndex({
    items,
    columnFields,
    valueFields,
  })

  return valueColumns.map((column, index) => {
    const { aggregated, matchCount } = getPivotAggregatedValue({
      index: aggregationIndex,
      columnPath: column.columnPath,
      valueField: column.valueField,
    })
    const showValue = matchCount > 0 || kind !== 'data'

    return {
      id: `${itemId}-value-${index}`,
      kind,
      columnId: column.id,
      columnPath: column.columnPath,
      valueField: column.valueField,
      value: column.value,
      aggregated,
      formattedValue: showValue ? formatPivotValue({ value: aggregated, formatNumber }) : '',
    }
  })
}

function buildValueItem<T>(payload: IBuildValueItemPayload<T>): IPivotValueItem<T> {
  const { itemId, kind, groupIds, ...valueContext } = payload

  return {
    id: itemId,
    kind,
    groupIds,
    cells: buildValueCells({ itemId, kind, ...valueContext }),
  }
}

function setCollapsedGroupValueItem<T>(payload: ISetCollapsedGroupValueItemPayload<T>) {
  const { row, groupId, ...valueContext } = payload

  row.valueItem.collapsedGroupValueItems ??= {}
  row.valueItem.collapsedGroupValueItems[groupId] = buildValueItem({
    itemId: `${row.id}-collapsed-${groupId}`,
    kind: 'data',
    groupIds: row.groupIds,
    ...valueContext,
  })
}

function buildDataItem<T>(payload: IBuildDataItemPayload<T>): IPivotDataItem<T> {
  const {
    path,
    rowFields,
    cellKinds,
    kind = 'data',
    ...valueContext
  } = payload

  const pathId = path.join('|')
  const refItem = valueContext.items[0]!
  const itemId = kind === 'data' ? pathId : `${kind}:${pathId}`
  const groupPath = path.filter(part => !part.startsWith('__'))
  const label = groupPath.join(' / ')
  const groupIds = groupPath.map((_, index) => getPivotGroupId(groupPath, index))

  const rowItem: IPivotRowItem<T> = {
    id: itemId,
    label,
    kind,
    cells: buildRowCells({ rowFields, cellKinds, itemId, refItem, groupPath }),
  }

  const valueItem = buildValueItem({ itemId, kind, groupIds, ...valueContext })

  return {
    id: itemId,
    label,
    groupPath,
    groupIds,
    rowItem,
    valueItem,
  }
}

function buildTabularRows<T>(payload: IBuildTabularRowsPayload<T>): IPivotDataItem<T>[] {
  const {
    items,
    rowFields,
    level = 0,
    parentPath = [],
    ...valueContext
  } = payload

  if (!rowFields.length) {
    return []
  }

  const field = rowFields[level]!
  const groups = pivotGroupBy(items, field.field)
  const sortedKeys = [...groups.keys()].sort()
  const results: IPivotDataItem<T>[] = []

  for (const key of sortedKeys) {
    const groupItems = groups.get(key)!
    const currentPath = [...parentPath, key]

    if (level < rowFields.length - 1) {
      const childRows = buildTabularRows({
        items: groupItems,
        rowFields,
        level: level + 1,
        parentPath: currentPath,
        ...valueContext,
      })

      childRows.forEach((row, childIndex) => {
        if (row.rowItem.kind !== 'data') {
          return
        }

        const labelCell = row.rowItem.cells.find(cell => cell.rowFieldIndex === level)

        if (labelCell) {
          labelCell.kind = childIndex === 0 ? 'rowLabel' : 'empty'

          if (childIndex === 0) {
            setCollapsedGroupValueItem({
              row,
              groupId: labelCell.groupId,
              items: groupItems,
              ...valueContext,
            })
          }
        }
      })

      results.push(...childRows)

      const subtotalCellKinds = rowFields.map((_, index) =>
        index === level ? 'subtotal' as const : 'empty' as const,
      )

      results.push(buildDataItem({
        path: [...currentPath, '__subtotal__'],
        rowFields,
        cellKinds: subtotalCellKinds,
        items: groupItems,
        kind: 'subtotal',
        ...valueContext,
      }))
    } else {
      const rowCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      results.push(buildDataItem({
        path: currentPath,
        rowFields,
        cellKinds: rowCellKinds,
        items: groupItems,
        ...valueContext,
      }))
    }
  }

  return results
}

export function pivotTransformDataCore<T = IItem>(
  payload: IPivotTransformCorePayload<T>,
): IPivotTransformResult<T> {
  const {
    data,
    rows: rowFields,
    columns: columnFields,
    values: valueFields,
  } = payload

  const formatNumber = resolveFormatNumber(payload)

  const { valueColumns, valueHeaderRows, columnTree } = buildPivotValueColumns(
    data,
    columnFields,
    valueFields,
  )

  if (!data.length || !rowFields.length) {
    return {
      data: [],
      valueColumns,
      valueHeaderRows,
      columnTree,
      stickyIndices: [],
    }
  }

  const valueContext = {
    valueColumns,
    columnFields,
    valueFields,
    formatNumber,
  }

  const tabularRows = buildTabularRows({
    items: data,
    rowFields,
    ...valueContext,
  })

  const grandTotalCellKinds = rowFields.map((_, index) =>
    index === 0 ? 'grandTotal' as const : 'empty' as const,
  )

  tabularRows.push(buildDataItem({
    path: ['__grand_total__'],
    rowFields,
    cellKinds: grandTotalCellKinds,
    items: data,
    kind: 'grandTotal',
    ...valueContext,
  }))

  return {
    data: tabularRows,
    valueColumns,
    valueHeaderRows,
    columnTree,
    stickyIndices: getPivotStickyIndices(tabularRows, rowFields.length),
  }
}

export function rehydratePivotTransformResult<T>(
  result: IPivotTransformResult<T>,
  payload: {
    rows: PivotRow<T>[]
    values: PivotValue<T>[]
  },
): IPivotTransformResult<T> {
  const rowByField = new Map(payload.rows.map(row => [String(row.field), row]))
  const valueByField = new Map(payload.values.map(value => [String(value.field), value]))

  const rehydrateValueField = (field: ObjectKey<T>) => {
    return valueByField.get(String(field)) ?? field
  }

  const rehydrateRowField = (field?: ObjectKey<T> | PivotRow<T>) => {
    const key = typeof field === 'object' && field !== null && 'field' in field
      ? String(field.field)
      : String(field)

    return rowByField.get(key) ?? field
  }

  for (const column of result.valueColumns) {
    column.value = rehydrateValueField(column.valueField) as PivotValue<T>
  }

  for (const item of result.data) {
    for (const cell of item.rowItem.cells) {
      cell.row = rehydrateRowField(cell.row) as PivotRow<T>
    }

    for (const cell of item.valueItem.cells) {
      cell.value = rehydrateValueField(cell.valueField) as PivotValue<T>
    }

    if (item.valueItem.collapsedGroupValueItems) {
      for (const collapsedItem of Object.values(item.valueItem.collapsedGroupValueItems)) {
        for (const cell of collapsedItem.cells) {
          cell.value = rehydrateValueField(cell.valueField) as PivotValue<T>
        }
      }
    }
  }

  return result
}

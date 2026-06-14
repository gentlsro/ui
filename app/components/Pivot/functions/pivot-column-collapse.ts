import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'

// Models
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

import {
  getInitialCollapsedGroupIds,
  togglePivotGroupCollapse,
} from './pivot-group-collapse'

export type IPivotColumnTreeNode = {
  key: string
  path: string[]
  children: IPivotColumnTreeNode[]
}

const COLUMN_GROUP_ID_PREFIX = 'c:'

export function getPivotColumnGroupId(columnPath: string[], columnFieldIndex?: number) {
  if (columnFieldIndex === undefined) {
    return `${COLUMN_GROUP_ID_PREFIX}${columnPath.join('|')}`
  }

  return `${COLUMN_GROUP_ID_PREFIX}${columnFieldIndex}:${columnPath.slice(0, columnFieldIndex + 1).join('|')}`
}

export function isPivotColumnGroupCollapsed(
  collapsedColumnGroupIds: Set<string>,
  columnPath: string[],
  level: number,
) {
  const groupId = getPivotColumnGroupId(columnPath, level)

  return collapsedColumnGroupIds.has(groupId)
}

function hasCollapsedColumnAncestor(
  columnPath: string[],
  collapsedColumnGroupIds: Set<string>,
  upToLevel: number,
) {
  for (let level = 0; level < upToLevel; level++) {
    if (isPivotColumnGroupCollapsed(collapsedColumnGroupIds, columnPath, level)) {
      return true
    }
  }

  return false
}

function getVisibleColumnCount(
  node: IPivotColumnTreeNode,
  level: number,
  columnFieldCount: number,
  collapsedColumnGroupIds: Set<string>,
  valuesCount: number,
): number {
  if (
    level < columnFieldCount - 1
    && isPivotColumnGroupCollapsed(collapsedColumnGroupIds, node.path, level)
  ) {
    return valuesCount
  }

  if (node.children.length) {
    return node.children.reduce(
      (sum, child) => sum + getVisibleColumnCount(
        child,
        level + 1,
        columnFieldCount,
        collapsedColumnGroupIds,
        valuesCount,
      ),
      0,
    )
  }

  return valuesCount
}

function getCollapsedHeaderRowspan(payload: {
  level: number
  columnFieldCount: number
  hasMultipleValues: boolean
}) {
  const { level, columnFieldCount, hasMultipleValues } = payload
  const remainingLevels = columnFieldCount - level

  return remainingLevels + (hasMultipleValues ? 1 : 0)
}

function collectVisibleValueColumns<T>(
  nodes: IPivotColumnTreeNode[],
  level: number,
  columnFieldCount: number,
  collapsedColumnGroupIds: Set<string>,
  valueFields: PivotValue<T>[],
): IPivotValueColumnItem<T>[] {
  const columns: IPivotValueColumnItem<T>[] = []

  for (const node of nodes) {
    const isCollapsed = level < columnFieldCount - 1
      && isPivotColumnGroupCollapsed(collapsedColumnGroupIds, node.path, level)

    if (isCollapsed) {
      for (const valueField of valueFields) {
        const pathLabel = node.path.join(' / ')

        columns.push({
          id: `collapsed:${node.path.join('|')}|${String(valueField.field)}`,
          columnPath: node.path,
          valueField: valueField.field,
          value: valueField,
          label: valueFields.length > 1
            ? `${pathLabel} / ${valueField._label}`
            : pathLabel,
          width: valueField.widthResolved,
          isCollapsedGroupColumn: true,
        })
      }

      continue
    }

    if (node.children.length) {
      columns.push(...collectVisibleValueColumns(
        node.children,
        level + 1,
        columnFieldCount,
        collapsedColumnGroupIds,
        valueFields,
      ))
      continue
    }

    for (const valueField of valueFields) {
      const pathLabel = node.path.join(' / ')

      columns.push({
        id: `${node.path.join('|')}|${String(valueField.field)}`,
        columnPath: node.path,
        valueField: valueField.field,
        value: valueField,
        label: valueFields.length > 1
          ? `${pathLabel} / ${valueField._label}`
          : pathLabel,
        width: valueField.widthResolved,
      })
    }
  }

  return columns
}

function addVisibleHeaderNodesAtLevel(
  row: IPivotValueHeaderCell[],
  nodes: IPivotColumnTreeNode[],
  targetLevel: number,
  currentLevel: number,
  payload: {
    columnFieldCount: number
    collapsedColumnGroupIds: Set<string>
    valuesCount: number
    hasMultipleValues: boolean
  },
) {
  const { columnFieldCount, collapsedColumnGroupIds, valuesCount, hasMultipleValues } = payload

  for (const node of nodes) {
    const isCollapsed = currentLevel < columnFieldCount - 1
      && isPivotColumnGroupCollapsed(collapsedColumnGroupIds, node.path, currentLevel)

    if (currentLevel === targetLevel) {
      if (hasCollapsedColumnAncestor(node.path, collapsedColumnGroupIds, currentLevel)) {
        continue
      }

      row.push({
        id: `header:${targetLevel}:${node.path.join('|')}`,
        label: node.key,
        colspan: getVisibleColumnCount(
          node,
          currentLevel,
          columnFieldCount,
          collapsedColumnGroupIds,
          valuesCount,
        ),
        rowspan: isCollapsed
          ? getCollapsedHeaderRowspan({
              level: currentLevel,
              columnFieldCount,
              hasMultipleValues,
            })
          : 1,
        level: targetLevel,
        groupId: getPivotColumnGroupId(node.path, currentLevel),
        columnFieldIndex: currentLevel,
      })
    } else if (!isCollapsed && node.children.length) {
      addVisibleHeaderNodesAtLevel(
        row,
        node.children,
        targetLevel,
        currentLevel + 1,
        payload,
      )
    }
  }
}

function buildVisibleValueHeaderRows<T>(
  columnFields: PivotColumn<T>[],
  valueFields: PivotValue<T>[],
  tree: IPivotColumnTreeNode[],
  collapsedColumnGroupIds: Set<string>,
): IPivotValueHeaderCell[][] {
  const rows: IPivotValueHeaderCell[][] = []
  const valuesCount = valueFields.length
  const hasMultipleValues = valuesCount > 1
  const columnFieldCount = columnFields.length
  const totalHeaderRows = columnFieldCount + (hasMultipleValues ? 1 : 0)
  const grandTotalRowspan = hasMultipleValues
    ? columnFieldCount
    : totalHeaderRows
  const headerPayload = {
    columnFieldCount,
    collapsedColumnGroupIds,
    valuesCount,
    hasMultipleValues,
  }

  for (let level = 0; level < columnFieldCount; level++) {
    const row: IPivotValueHeaderCell[] = []

    addVisibleHeaderNodesAtLevel(row, tree, level, 0, headerPayload)

    if (level === 0) {
      row.push({
        id: 'header:grand-total',
        label: 'Grand Total',
        colspan: valuesCount,
        rowspan: grandTotalRowspan,
        level: 0,
      })
    }

    rows.push(row)
  }

  if (hasMultipleValues) {
    const row: IPivotValueHeaderCell[] = []
    const visibleColumns = collectVisibleValueColumns(
      tree,
      0,
      columnFieldCount,
      collapsedColumnGroupIds,
      valueFields,
    )

    for (const column of visibleColumns) {
      if (column.isCollapsedGroupColumn) {
        continue
      }

      row.push({
        id: `header:value:${column.id}`,
        label: column.value._label,
        colspan: 1,
        rowspan: 1,
        level: columnFieldCount,
        width: column.width,
      })
    }

    for (const valueField of valueFields) {
      row.push({
        id: `header:grand-total:${String(valueField.field)}`,
        label: valueField._label,
        colspan: 1,
        rowspan: 1,
        level: columnFieldCount,
        width: valueField.widthResolved,
      })
    }

    rows.push(row)
  }

  return rows
}

export function buildVisiblePivotValueColumns<T>(payload: {
  columnFields: PivotColumn<T>[]
  valueFields: PivotValue<T>[]
  tree: IPivotColumnTreeNode[]
  collapsedColumnGroupIds: Set<string>
  allValueColumns: IPivotValueColumnItem<T>[]
}): {
  valueColumns: IPivotValueColumnItem<T>[]
  valueHeaderRows: IPivotValueHeaderCell[][]
} {
  const {
    columnFields,
    valueFields,
    tree,
    collapsedColumnGroupIds,
    allValueColumns,
  } = payload

  if (!valueFields.length) {
    return { valueColumns: [], valueHeaderRows: [] }
  }

  if (!columnFields.length) {
    return {
      valueColumns: allValueColumns,
      valueHeaderRows: allValueColumns.map(col => ([{
        id: `header:${col.id}`,
        label: col.isGrandTotal ? 'Grand Total' : col.value._label,
        colspan: 1,
        rowspan: 1,
        level: 0,
        width: col.width,
      }])),
    }
  }

  const valueColumns = collectVisibleValueColumns(
    tree,
    0,
    columnFields.length,
    collapsedColumnGroupIds,
    valueFields,
  )

  for (const valueField of valueFields) {
    valueColumns.push({
      id: `grand-total|${String(valueField.field)}`,
      columnPath: ['__grand_total__'],
      valueField: valueField.field,
      value: valueField,
      label: valueFields.length > 1
        ? `Grand Total / ${valueField._label}`
        : 'Grand Total',
      isGrandTotal: true,
      width: valueField.widthResolved,
    })
  }

  const valueHeaderRows = tree.length
    ? buildVisibleValueHeaderRows(columnFields, valueFields, tree, collapsedColumnGroupIds)
    : []

  return { valueColumns, valueHeaderRows }
}

export function getInitialCollapsedColumnGroupIds(
  tree: IPivotColumnTreeNode[],
  expandedLevelOnInit = 0,
  columnFieldCount = 0,
) {
  const groupPaths: string[][] = []

  function collectGroupPaths(nodes: IPivotColumnTreeNode[], level: number) {
    for (const node of nodes) {
      groupPaths.push(node.path)

      if (node.children.length) {
        collectGroupPaths(node.children, level + 1)
      }
    }
  }

  collectGroupPaths(tree, 0)

  const dataLikeItems = groupPaths.map(path => ({
    groupIds: path.map((_, index) => getPivotColumnGroupId(path, index)),
  }))

  return getInitialCollapsedGroupIds(
    dataLikeItems as any,
    expandedLevelOnInit,
    columnFieldCount,
  )
}

export function isPivotColumnHeaderHidden(
  groupId: string,
  collapsedColumnGroupIds: Set<string>,
) {
  const match = groupId.match(/^c:(\d+):(.+)$/)

  if (!match) {
    return false
  }

  const level = Number(match[1])
  const path = match[2]!

  for (const collapsedId of collapsedColumnGroupIds) {
    if (collapsedId === groupId) {
      continue
    }

    const collapsedMatch = collapsedId.match(/^c:(\d+):(.+)$/)

    if (!collapsedMatch) {
      continue
    }

    const collapsedLevel = Number(collapsedMatch[1])
    const collapsedPath = collapsedMatch[2]!

    if (collapsedLevel < level && path.startsWith(`${collapsedPath}|`)) {
      return true
    }
  }

  return false
}

export function togglePivotColumnGroupCollapse(
  collapsedColumnGroupIds: Set<string>,
  groupId: string,
) {
  return togglePivotGroupCollapse(collapsedColumnGroupIds, groupId)
}

export function aggregatePivotValueCellsForColumn<T>(payload: {
  cells: Array<{
    columnPath: string[]
    valueField: ObjectKey<T>
    aggregated: number
    formattedValue: string
    kind?: string
    value: PivotValue<T>
  }>
  column: {
    id: string
    columnPath: string[]
    valueField: ObjectKey<T>
    value: PivotValue<T>
  }
  formatNumber: (value: number) => string
}) {
  const { cells, column, formatNumber } = payload
  const matchingCells = cells.filter(cell => {
    return cell.valueField === column.valueField
      && column.columnPath.every((key, index) => cell.columnPath[index] === key)
      && cell.columnPath[0] !== '__grand_total__'
      && cell.kind !== 'emptyRow'
  })

  const aggregated = matchingCells.reduce((sum, cell) => sum + cell.aggregated, 0)
  const showValue = matchingCells.length > 0

  return {
    id: `${column.id}-aggregated`,
    kind: matchingCells[0]?.kind,
    columnId: column.id,
    columnPath: column.columnPath,
    valueField: column.valueField,
    value: column.value,
    aggregated,
    formattedValue: showValue && Number.isFinite(aggregated)
      ? formatNumber(aggregated)
      : '',
  } as IPivotValueItemCell<T>
}

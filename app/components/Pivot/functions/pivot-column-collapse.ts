import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'

// Models
import type { PivotItem } from '../models/pivot-item.model'

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

export function isPivotColumnGroupCollapsed(payload: {
  collapsedColumnGroupIds: Set<string>
  columnPath: string[]
  level: number
}) {
  const { collapsedColumnGroupIds, columnPath, level } = payload
  const groupId = getPivotColumnGroupId(columnPath, level)

  return collapsedColumnGroupIds.has(groupId)
}

function hasCollapsedColumnAncestor(payload: {
  columnPath: string[]
  collapsedColumnGroupIds: Set<string>
  upToLevel: number
}) {
  const { columnPath, collapsedColumnGroupIds, upToLevel } = payload

  for (let level = 0; level < upToLevel; level++) {
    if (isPivotColumnGroupCollapsed({ collapsedColumnGroupIds, columnPath, level })) {
      return true
    }
  }

  return false
}

function getVisibleColumnCount(payload: {
  node: IPivotColumnTreeNode
  level: number
  columnFieldCount: number
  collapsedColumnGroupIds: Set<string>
  valuesCount: number
}): number {
  const { node, level, columnFieldCount, collapsedColumnGroupIds, valuesCount } = payload

  if (
    level < columnFieldCount - 1
    && isPivotColumnGroupCollapsed({ collapsedColumnGroupIds, columnPath: node.path, level })
  ) {
    return valuesCount
  }

  if (node.children.length) {
    return node.children.reduce(
      (sum, child) => sum + getVisibleColumnCount({
        node: child,
        level: level + 1,
        columnFieldCount,
        collapsedColumnGroupIds,
        valuesCount,
      }),
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

function collectVisibleValueColumns<T>(payload: {
  nodes: IPivotColumnTreeNode[]
  level: number
  columnFieldCount: number
  collapsedColumnGroupIds: Set<string>
  valueFields: PivotItem<T>[]
}): IPivotValueColumnItem<T>[] {
  const { nodes, level, columnFieldCount, collapsedColumnGroupIds, valueFields } = payload
  const columns: IPivotValueColumnItem<T>[] = []

  for (const node of nodes) {
    const isCollapsed = level < columnFieldCount - 1
      && isPivotColumnGroupCollapsed({ collapsedColumnGroupIds, columnPath: node.path, level })

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
      columns.push(...collectVisibleValueColumns({
        nodes: node.children,
        level: level + 1,
        columnFieldCount,
        collapsedColumnGroupIds,
        valueFields,
      }))
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

function addVisibleHeaderNodesAtLevel(payload: {
  row: IPivotValueHeaderCell[]
  nodes: IPivotColumnTreeNode[]
  targetLevel: number
  currentLevel: number
  columnFieldCount: number
  collapsedColumnGroupIds: Set<string>
  valuesCount: number
  hasMultipleValues: boolean
}) {
  const {
    row,
    nodes,
    targetLevel,
    currentLevel,
    columnFieldCount,
    collapsedColumnGroupIds,
    valuesCount,
    hasMultipleValues,
  } = payload

  for (const node of nodes) {
    const isCollapsed = currentLevel < columnFieldCount - 1
      && isPivotColumnGroupCollapsed({ collapsedColumnGroupIds, columnPath: node.path, level: currentLevel })

    if (currentLevel === targetLevel) {
      if (hasCollapsedColumnAncestor({ columnPath: node.path, collapsedColumnGroupIds, upToLevel: currentLevel })) {
        continue
      }

      row.push({
        id: `header:${targetLevel}:${node.path.join('|')}`,
        label: node.key,
        colspan: getVisibleColumnCount({
          node,
          level: currentLevel,
          columnFieldCount,
          collapsedColumnGroupIds,
          valuesCount,
        }),
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
      addVisibleHeaderNodesAtLevel({
        row,
        nodes: node.children,
        targetLevel,
        currentLevel: currentLevel + 1,
        columnFieldCount,
        collapsedColumnGroupIds,
        valuesCount,
        hasMultipleValues,
      })
    }
  }
}

function buildVisibleValueHeaderRows<T>(payload: {
  columnFields: PivotItem<T>[]
  valueFields: PivotItem<T>[]
  tree: IPivotColumnTreeNode[]
  collapsedColumnGroupIds: Set<string>
}): IPivotValueHeaderCell[][] {
  const { columnFields, valueFields, tree, collapsedColumnGroupIds } = payload
  const rows: IPivotValueHeaderCell[][] = []
  const valuesCount = valueFields.length
  const hasMultipleValues = valuesCount > 1
  const columnFieldCount = columnFields.length
  const totalHeaderRows = columnFieldCount + (hasMultipleValues ? 1 : 0)
  const grandTotalRowspan = hasMultipleValues
    ? columnFieldCount
    : totalHeaderRows

  for (let level = 0; level < columnFieldCount; level++) {
    const row: IPivotValueHeaderCell[] = []

    addVisibleHeaderNodesAtLevel({
      row,
      nodes: tree,
      targetLevel: level,
      currentLevel: 0,
      columnFieldCount,
      collapsedColumnGroupIds,
      valuesCount,
      hasMultipleValues,
    })

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
    const visibleColumns = collectVisibleValueColumns({
      nodes: tree,
      level: 0,
      columnFieldCount,
      collapsedColumnGroupIds,
      valueFields,
    })

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
  columnFields: PivotItem<T>[]
  valueFields: PivotItem<T>[]
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

  const valueColumns = collectVisibleValueColumns({
    nodes: tree,
    level: 0,
    columnFieldCount: columnFields.length,
    collapsedColumnGroupIds,
    valueFields,
  })

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
    ? buildVisibleValueHeaderRows({ columnFields, valueFields, tree, collapsedColumnGroupIds })
    : []

  return { valueColumns, valueHeaderRows }
}

export function getInitialCollapsedColumnGroupIds(payload: {
  tree: IPivotColumnTreeNode[]
  expandedLevelOnInit?: number
  columnFieldCount?: number
}) {
  const {
    tree,
    expandedLevelOnInit = 0,
    columnFieldCount = 0,
  } = payload
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

  return getInitialCollapsedGroupIds({
    data: dataLikeItems as any,
    expandedLevelOnInit,
    rowFieldCount: columnFieldCount,
  })
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
    value: PivotItem<T>
  }>
  column: {
    id: string
    columnPath: string[]
    valueField: ObjectKey<T>
    value: PivotItem<T>
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

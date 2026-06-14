import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotColumnTreeNode } from './pivot-column-collapse'
import { pivotGroupBy } from './pivot-group-by'

// Models
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

function buildColumnTree<T>(
  items: T[],
  columnFields: PivotColumn<T>[],
  level = 0,
  parentPath: string[] = [],
): IPivotColumnTreeNode[] {
  if (!columnFields.length || level >= columnFields.length) {
    return []
  }

  const field = columnFields[level]!
  const groups = pivotGroupBy(items, field.field)
  const sortedKeys = [...groups.keys()].sort()

  return sortedKeys.map(key => {
    const currentPath = [...parentPath, key]
    const groupItems = groups.get(key)!
    const children = level < columnFields.length - 1
      ? buildColumnTree(groupItems, columnFields, level + 1, currentPath)
      : []

    return {
      key,
      path: currentPath,
      children,
    }
  })
}

function flattenColumnTreeLeaves(nodes: IPivotColumnTreeNode[]): IPivotColumnTreeNode[] {
  const results: IPivotColumnTreeNode[] = []

  for (const node of nodes) {
    if (node.children.length) {
      results.push(...flattenColumnTreeLeaves(node.children))
    } else {
      results.push(node)
    }
  }

  return results
}

function getNodeColspan(node: IPivotColumnTreeNode, valuesCount: number): number {
  if (node.children.length) {
    return node.children.reduce(
      (sum, child) => sum + getNodeColspan(child, valuesCount),
      0,
    )
  }

  return valuesCount
}

function buildValueHeaderRows<T>(
  columnFields: PivotColumn<T>[],
  valueFields: PivotValue<T>[],
  tree: IPivotColumnTreeNode[],
  leaves: IPivotColumnTreeNode[],
): IPivotValueHeaderCell[][] {
  const rows: IPivotValueHeaderCell[][] = []
  const valuesCount = valueFields.length
  const hasMultipleValues = valuesCount > 1
  const totalHeaderRows = columnFields.length + (hasMultipleValues ? 1 : 0)
  const grandTotalRowspan = hasMultipleValues
    ? columnFields.length
    : totalHeaderRows

  function addNodesAtLevel(
    row: IPivotValueHeaderCell[],
    nodes: IPivotColumnTreeNode[],
    targetLevel: number,
    currentLevel = 0,
  ) {
    for (const node of nodes) {
      if (currentLevel === targetLevel) {
        row.push({
          id: `header:${targetLevel}:${node.path.join('|')}`,
          label: node.key,
          colspan: getNodeColspan(node, valuesCount),
          rowspan: 1,
          level: targetLevel,
        })
      } else if (node.children.length) {
        addNodesAtLevel(row, node.children, targetLevel, currentLevel + 1)
      }
    }
  }

  for (let level = 0; level < columnFields.length; level++) {
    const row: IPivotValueHeaderCell[] = []

    addNodesAtLevel(row, tree, level)

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

    for (const leaf of leaves) {
      for (const valueField of valueFields) {
        row.push({
          id: `header:value:${leaf.path.join('|')}|${String(valueField.field)}`,
          label: valueField._label,
          colspan: 1,
          rowspan: 1,
          level: columnFields.length,
          width: valueField.widthResolved,
        })
      }
    }

    for (const valueField of valueFields) {
      row.push({
        id: `header:grand-total:${String(valueField.field)}`,
        label: valueField._label,
        colspan: 1,
        rowspan: 1,
        level: columnFields.length,
        width: valueField.widthResolved,
      })
    }

    rows.push(row)
  }

  return rows
}

function buildFlatValueHeaderRows<T>(
  valueFields: PivotValue<T>[],
  valueColumns: IPivotValueColumnItem<T>[],
): IPivotValueHeaderCell[][] {
  return [
    valueColumns.map(col => ({
      id: `header:${col.id}`,
      label: col.isGrandTotal ? 'Grand Total' : col.value._label,
      colspan: 1,
      rowspan: 1,
      level: 0,
      width: col.width,
    })),
  ]
}

export function buildPivotValueColumns<T>(
  data: T[],
  columnFields: PivotColumn<T>[],
  valueFields: PivotValue<T>[],
): {
  valueColumns: IPivotValueColumnItem<T>[]
  valueHeaderRows: IPivotValueHeaderCell[][]
  columnTree: IPivotColumnTreeNode[]
} {
  if (!valueFields.length) {
    return { valueColumns: [], valueHeaderRows: [], columnTree: [] }
  }

  const valueColumns: IPivotValueColumnItem<T>[] = []

  if (!columnFields.length) {
    for (const valueField of valueFields) {
      valueColumns.push({
        id: `value:${String(valueField.field)}`,
        columnPath: [],
        valueField: valueField.field,
        value: valueField,
        label: valueField._label,
        width: valueField.widthResolved,
      })
    }

    for (const valueField of valueFields) {
      valueColumns.push({
        id: `grand-total:${String(valueField.field)}`,
        columnPath: ['__grand_total__'],
        valueField: valueField.field,
        value: valueField,
        label: 'Grand Total',
        isGrandTotal: true,
        width: valueField.widthResolved,
      })
    }

    return {
      valueColumns,
      valueHeaderRows: buildFlatValueHeaderRows(valueFields, valueColumns),
      columnTree: [],
    }
  }

  const tree = buildColumnTree(data, columnFields)
  const leaves = flattenColumnTreeLeaves(tree)

  for (const leaf of leaves) {
    for (const valueField of valueFields) {
      const pathLabel = leaf.path.join(' / ')

      valueColumns.push({
        id: `${leaf.path.join('|')}|${String(valueField.field)}`,
        columnPath: leaf.path,
        valueField: valueField.field,
        value: valueField,
        label: valueFields.length > 1
          ? `${pathLabel} / ${valueField._label}`
          : pathLabel,
        width: valueField.widthResolved,
      })
    }
  }

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

  const valueHeaderRows = leaves.length
    ? buildValueHeaderRows(columnFields, valueFields, tree, leaves)
    : buildFlatValueHeaderRows(valueFields, valueColumns)

  return { valueColumns, valueHeaderRows, columnTree: tree }
}

export function filterItemsByColumnPath<T>(
  items: T[],
  columnFields: PivotColumn<T>[],
  columnPath: string[],
) {
  if (!columnPath.length || columnPath[0] === '__grand_total__') {
    return items
  }

  return items.filter(item => {
    return columnPath.every((key, index) => {
      return String(get(item, columnFields[index]!.field) ?? '') === key
    })
  })
}

export function formatPivotValue(payload: {
  value: number
  formatNumber: (value: number) => string
}) {
  const { value, formatNumber } = payload

  if (!Number.isFinite(value)) {
    return ''
  }

  return formatNumber(value)
}

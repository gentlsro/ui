import { get } from 'lodash-es'

import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotColumnTreeNode } from './pivot-column-collapse'
import type {
  IPivotTransformColumnField,
  IPivotTransformValueField,
} from './pivot-transform-data-core'
import { pivotGroupBy } from './pivot-group-by'
import { getPivotPathId } from './pivot-path-id'

// Models
import type { PivotItem } from '../models/pivot-item.model'

export function buildPivotColumnTree<T extends IItem>(payload: {
  items: T[]
  columnFields: IPivotTransformColumnField<T>[]
  level?: number
  parentPath?: string[]
}): IPivotColumnTreeNode[] {
  const {
    items,
    columnFields,
    level = 0,
    parentPath = [],
  } = payload

  if (!columnFields.length || level >= columnFields.length) {
    return []
  }

  const field = columnFields[level]!
  const groups = pivotGroupBy(items, field.field, field.dataType)
  const sortedKeys = [...groups.keys()].sort()

  return sortedKeys.map(key => {
    const currentPath = [...parentPath, key]
    const groupItems = groups.get(key)!
    const children = level < columnFields.length - 1
      ? buildPivotColumnTree({
          items: groupItems,
          columnFields,
          level: level + 1,
          parentPath: currentPath,
        })
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

function buildValueHeaderRows<T extends IItem>(payload: {
  columnFields: IPivotTransformColumnField<T>[]
  valueFields: IPivotTransformValueField<T>[]
  tree: IPivotColumnTreeNode[]
  leaves: IPivotColumnTreeNode[]
  valuesOnRows?: boolean
}): IPivotValueHeaderCell[][] {
  const { columnFields, valueFields, tree, leaves, valuesOnRows } = payload
  const rows: IPivotValueHeaderCell[][] = []
  const expandMeasuresOnRows = valuesOnRows && valueFields.length > 1
  const valuesCount = expandMeasuresOnRows ? 1 : valueFields.length
  const hasMultipleValues = !expandMeasuresOnRows && valueFields.length > 1
  const totalHeaderRows = columnFields.length + (hasMultipleValues ? 1 : 0)
  const grandTotalRowspan = hasMultipleValues
    ? columnFields.length
    : totalHeaderRows

  function addNodesAtLevel(payload: {
    row: IPivotValueHeaderCell[]
    nodes: IPivotColumnTreeNode[]
    targetLevel: number
    currentLevel?: number
  }) {
    const { row, nodes, targetLevel, currentLevel = 0 } = payload

    for (const node of nodes) {
      if (currentLevel === targetLevel) {
        row.push({
          id: `header:${targetLevel}:${getPivotPathId(node.path)}`,
          label: node.key,
          colspan: getNodeColspan(node, valuesCount),
          rowspan: 1,
          level: targetLevel,
          columnFieldIndex: targetLevel,
        })
      } else if (node.children.length) {
        addNodesAtLevel({
          row,
          nodes: node.children,
          targetLevel,
          currentLevel: currentLevel + 1,
        })
      }
    }
  }

  for (let level = 0; level < columnFields.length; level++) {
    const row: IPivotValueHeaderCell[] = []

    addNodesAtLevel({ row, nodes: tree, targetLevel: level })

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
          id: `header:value:${getPivotPathId(leaf.path)}:${valueField.measureId}`,
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
        id: `header:grand-total:${valueField.measureId}`,
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

function buildFlatValueHeaderRows<T extends IItem>(
  valueFields: IPivotTransformValueField<T>[],
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

export function buildPivotValueColumns<T extends IItem>(payload: {
  data: T[]
  columnFields: IPivotTransformColumnField<T>[]
  valueFields: IPivotTransformValueField<T>[]
  columnTree?: IPivotColumnTreeNode[]
  valuesOnRows?: boolean
}): {
  valueColumns: IPivotValueColumnItem<T>[]
  valueHeaderRows: IPivotValueHeaderCell[][]
  columnTree: IPivotColumnTreeNode[]
} {
  const { data, columnFields, valueFields, columnTree, valuesOnRows } = payload

  if (!valueFields.length) {
    return { valueColumns: [], valueHeaderRows: [], columnTree: [] }
  }

  const expandMeasuresOnRows = valuesOnRows && valueFields.length > 1
  const primaryValueField = valueFields[0]!
  const valueColumns: IPivotValueColumnItem<T>[] = []

  if (!columnFields.length) {
    if (expandMeasuresOnRows) {
      valueColumns.push({
        id: 'value',
        columnPath: [],
        measureId: primaryValueField.measureId,
        valueField: primaryValueField.field,
        value: primaryValueField.item ?? { field: primaryValueField.field } as PivotItem<T>,
        label: primaryValueField._label,
        width: primaryValueField.widthResolved,
      })

      valueColumns.push({
        id: 'grand-total',
        columnPath: ['__grand_total__'],
        measureId: primaryValueField.measureId,
        valueField: primaryValueField.field,
        value: primaryValueField.item ?? { field: primaryValueField.field } as PivotItem<T>,
        label: 'Grand Total',
        isGrandTotal: true,
        width: primaryValueField.widthResolved,
      })
    } else {
      for (const valueField of valueFields) {
        valueColumns.push({
          id: `value:${valueField.measureId}`,
          columnPath: [],
          measureId: valueField.measureId,
          valueField: valueField.field,
          value: valueField.item ?? { field: valueField.field } as PivotItem<T>,
          label: valueField._label,
          width: valueField.widthResolved,
        })
      }

      for (const valueField of valueFields) {
        valueColumns.push({
          id: `grand-total:${valueField.measureId}`,
          columnPath: ['__grand_total__'],
          measureId: valueField.measureId,
          valueField: valueField.field,
          value: valueField.item ?? { field: valueField.field } as PivotItem<T>,
          label: 'Grand Total',
          isGrandTotal: true,
          width: valueField.widthResolved,
        })
      }
    }

    return {
      valueColumns,
      valueHeaderRows: buildFlatValueHeaderRows(valueFields, valueColumns),
      columnTree: [],
    }
  }

  const tree = columnTree ?? buildPivotColumnTree({ items: data, columnFields })
  const leaves = flattenColumnTreeLeaves(tree)

  if (expandMeasuresOnRows) {
    for (const leaf of leaves) {
      valueColumns.push({
        id: getPivotPathId(leaf.path),
        columnPath: leaf.path,
        measureId: primaryValueField.measureId,
        valueField: primaryValueField.field,
        value: primaryValueField.item ?? { field: primaryValueField.field } as PivotItem<T>,
        label: leaf.path.join(' / '),
        width: primaryValueField.widthResolved,
      })
    }

    valueColumns.push({
      id: 'grand-total',
      columnPath: ['__grand_total__'],
      measureId: primaryValueField.measureId,
      valueField: primaryValueField.field,
      value: primaryValueField.item ?? { field: primaryValueField.field } as PivotItem<T>,
      label: 'Grand Total',
      isGrandTotal: true,
      width: primaryValueField.widthResolved,
    })
  } else {
    for (const leaf of leaves) {
      for (const valueField of valueFields) {
        const pathLabel = leaf.path.join(' / ')

        valueColumns.push({
          id: `${getPivotPathId(leaf.path)}:${valueField.measureId}`,
          columnPath: leaf.path,
          measureId: valueField.measureId,
          valueField: valueField.field,
          value: valueField.item ?? { field: valueField.field } as PivotItem<T>,
          label: valueFields.length > 1
            ? `${pathLabel} / ${valueField._label}`
            : pathLabel,
          width: valueField.widthResolved,
        })
      }
    }

    for (const valueField of valueFields) {
      valueColumns.push({
        id: `grand-total:${valueField.measureId}`,
        columnPath: ['__grand_total__'],
        measureId: valueField.measureId,
        valueField: valueField.field,
        value: valueField.item ?? { field: valueField.field } as PivotItem<T>,
        label: valueFields.length > 1
          ? `Grand Total / ${valueField._label}`
          : 'Grand Total',
        isGrandTotal: true,
        width: valueField.widthResolved,
      })
    }
  }

  const valueHeaderRows = leaves.length
    ? buildValueHeaderRows({ columnFields, valueFields, tree, leaves, valuesOnRows })
    : buildFlatValueHeaderRows(valueFields, valueColumns)

  return { valueColumns, valueHeaderRows, columnTree: tree }
}

export function filterItemsByColumnPath<T extends IItem>(payload: {
  items: T[]
  columnFields: IPivotTransformColumnField<T>[]
  columnPath: string[]
}) {
  const { items, columnFields, columnPath } = payload

  if (!columnPath.length || columnPath[0] === '__grand_total__') {
    return items
  }

  return items.filter(item => {
    return columnPath.every((key, index) => {
      return String(get(item, columnFields[index]!.field) ?? '') === key
    })
  })
}

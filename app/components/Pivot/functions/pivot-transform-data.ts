// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotRowItem, PivotRowItemKind } from '../types/pivot-row-item.type'
import type { IPivotRowItemCell, PivotRowItemCellKind } from '../types/pivot-row-item-cell.type'
import type { IPivotValueItem } from '../types/pivot-value-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'

// Functions
import { getInitialCollapsedGroupIds, getPivotGroupId } from './pivot-group-collapse'
import {
  buildPivotValueColumns,
  filterItemsByColumnPath,
  formatPivotValue,
} from './pivot-build-value-columns'

// Models
import type { PivotRow } from '../models/pivot-row.model'
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'
import { SummaryItem } from '#layers/utilities/shared/models/summary-item.model'

type IPivotTransformPayload<T = IItem> = {
  data: T[]
  rows: PivotRow<T>[]
  columns: PivotColumn<T>[]
  values: PivotValue<T>[]
  state: IPivotState
  collapseConfig: IPivotProps<T>['collapseConfig']
  isFirstRender?: Ref<boolean>
}

function groupBy<T>(items: T[], field: ObjectKey<T>): Map<string, T[]> {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const key = String(get(item, field) ?? '')
    const group = map.get(key)

    if (group) {
      group.push(item)
    } else {
      map.set(key, [item])
    }
  }

  return map
}

function buildRowCells<T>(
  rowFields: PivotRow<T>[],
  cellKinds: PivotRowItemCellKind[],
  itemId: string,
  refItem: T,
  groupPath: string[],
): IPivotRowItemCell<T>[] {
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

function buildValueCells<T>(
  items: T[],
  itemId: string,
  kind: PivotRowItemKind,
  valueColumns: IPivotValueColumnItem<T>[],
  columnFields: PivotColumn<T>[],
): IPivotValueItemCell<T>[] {
  const { calculateSummary } = useSummaries()

  return valueColumns.map((column, index) => {
    const filtered = filterItemsByColumnPath(items, columnFields, column.columnPath)
    const summaryItem = new SummaryItem({
      field: column.value.field,
      summaryType: column.value.summaryType,
      summaryFormat: column.value.summaryFormat,
      label: column.value._label,
    })
    const aggregated = calculateSummary(summaryItem, filtered)
    const showValue = filtered.length > 0 || kind !== 'data'

    return {
      id: `${itemId}-value-${index}`,
      kind,
      columnId: column.id,
      columnPath: column.columnPath,
      valueField: column.valueField,
      value: column.value,
      aggregated,
      formattedValue: showValue ? formatPivotValue(aggregated, column.value) : '',
    }
  })
}

function buildValueItem<T>(
  itemId: string,
  kind: PivotRowItemKind,
  items: T[],
  valueColumns: IPivotValueColumnItem<T>[],
  columnFields: PivotColumn<T>[],
  groupIds: string[],
): IPivotValueItem<T> {
  return {
    id: itemId,
    kind,
    groupIds,
    cells: buildValueCells(items, itemId, kind, valueColumns, columnFields),
  }
}

function setCollapsedGroupValueItem<T>(
  row: IPivotDataItem<T>,
  groupId: string,
  groupItems: T[],
  valueColumns: IPivotValueColumnItem<T>[],
  columnFields: PivotColumn<T>[],
) {
  row.valueItem.collapsedGroupValueItems ??= {}
  row.valueItem.collapsedGroupValueItems[groupId] = buildValueItem(
    `${row.id}-collapsed-${groupId}`,
    'data',
    groupItems,
    valueColumns,
    columnFields,
    row.groupIds,
  )
}

function buildDataItem<T>(
  path: string[],
  rowFields: PivotRow<T>[],
  cellKinds: PivotRowItemCellKind[],
  items: T[],
  valueColumns: IPivotValueColumnItem<T>[],
  columnFields: PivotColumn<T>[],
  kind: PivotRowItemKind = 'data',
): IPivotDataItem<T> {
  const pathId = path.join('|')
  const refItem = items[0]!
  const itemId = kind === 'data' ? pathId : `${kind}:${pathId}`
  const label = path.filter(part => !part.startsWith('__')).join(' / ')
  const groupPath = path.filter(part => !part.startsWith('__'))
  const groupIds = groupPath.map((_, index) => getPivotGroupId(groupPath, index))

  const rowItem: IPivotRowItem<T> = {
    id: itemId,
    label,
    kind,
    cells: buildRowCells(rowFields, cellKinds, itemId, refItem, groupPath),
  }

  const valueItem = buildValueItem(itemId, kind, items, valueColumns, columnFields, groupIds)

  return {
    id: itemId,
    label,
    groupPath,
    groupIds,
    rowItem,
    valueItem,
  }
}

function buildTabularRows<T>(
  items: T[],
  rowFields: PivotRow<T>[],
  valueColumns: IPivotValueColumnItem<T>[],
  columnFields: PivotColumn<T>[],
  level = 0,
  parentPath: string[] = [],
): IPivotDataItem<T>[] {
  if (!rowFields.length) {
    return []
  }

  const field = rowFields[level]!
  const groups = groupBy(items, field.field)
  const sortedKeys = [...groups.keys()].sort()
  const results: IPivotDataItem<T>[] = []

  for (const key of sortedKeys) {
    const groupItems = groups.get(key)!
    const currentPath = [...parentPath, key]

    if (level < rowFields.length - 1) {
      const childRows = buildTabularRows(
        groupItems,
        rowFields,
        valueColumns,
        columnFields,
        level + 1,
        currentPath,
      )

      childRows.forEach((row, childIndex) => {
        if (row.rowItem.kind !== 'data') {
          return
        }

        const labelCell = row.rowItem.cells.find(cell => cell.rowFieldIndex === level)

        if (labelCell) {
          labelCell.kind = childIndex === 0 ? 'rowLabel' : 'empty'

          if (childIndex === 0) {
            setCollapsedGroupValueItem(
              row,
              labelCell.groupId,
              groupItems,
              valueColumns,
              columnFields,
            )
          }
        }
      })

      results.push(...childRows)

      const subtotalCellKinds = rowFields.map((_, index) =>
        index === level ? 'subtotal' as const : 'empty' as const,
      )

      results.push(buildDataItem(
        [...currentPath, '__subtotal__'],
        rowFields,
        subtotalCellKinds,
        groupItems,
        valueColumns,
        columnFields,
        'subtotal',
      ))
    } else {
      const rowCellKinds = rowFields.map((_, index) =>
        index === level ? 'rowLabel' as const : 'empty' as const,
      )

      results.push(buildDataItem(
        currentPath,
        rowFields,
        rowCellKinds,
        groupItems,
        valueColumns,
        columnFields,
      ))
    }
  }

  return results
}

function buildEmptyDataItem<T>(
  afterRowId: string,
  rowFields: PivotRow<T>[],
  valueColumns: IPivotValueColumnItem<T>[],
): IPivotDataItem<T> {
  const itemId = `empty:${afterRowId}`

  return {
    id: itemId,
    label: '',
    groupPath: [],
    groupIds: [],
    rowItem: {
      id: itemId,
      label: '',
      kind: 'emptyRow',
      cells: rowFields.map((rowField, index) => ({
        id: `${itemId}-cell-${index}`,
        kind: 'empty',
        rowFieldIndex: index,
        row: rowField,
        groupId: '',
        ref: {} as T,
      })),
    },
    valueItem: {
      id: itemId,
      kind: 'emptyRow',
      groupIds: [],
      cells: valueColumns.map((column, index) => ({
        id: `${itemId}-value-${index}`,
        kind: 'emptyRow',
        columnId: column.id,
        columnPath: column.columnPath,
        valueField: column.valueField,
        value: column.value,
        aggregated: 0,
        formattedValue: '',
      })),
    },
  }
}

export function shouldInsertPivotEmptyRowAfter<T>(
  row: IPivotDataItem<T>,
  collapsedGroupIds: Set<string>,
  rowFieldCount: number,
) {
  if (row.rowItem.kind === 'grandTotal' || row.rowItem.kind === 'emptyRow') {
    return false
  }

  if (row.rowItem.kind === 'subtotal') {
    return true
  }

  if (row.rowItem.kind !== 'data') {
    return false
  }

  for (const cell of row.rowItem.cells) {
    if (cell.kind !== 'rowLabel') {
      continue
    }

    const level = cell.rowFieldIndex

    if (level === undefined) {
      continue
    }

    const groupId = row.groupIds[level]

    if (groupId && collapsedGroupIds.has(groupId)) {
      return true
    }

    if (level === rowFieldCount - 1 && rowFieldCount <= 2) {
      return true
    }
  }

  return false
}

export function applyPivotEmptyRows<T>(
  visibleRows: IPivotDataItem<T>[],
  payload: {
    useEmptyRow?: boolean
    rowFieldCount: number
    collapsedGroupIds: Set<string>
    rowFields: PivotRow<T>[]
    valueColumns: IPivotValueColumnItem<T>[]
  },
) {
  if (!payload.useEmptyRow) {
    return visibleRows
  }

  const result: IPivotDataItem<T>[] = []

  for (const row of visibleRows) {
    result.push(row)

    if (shouldInsertPivotEmptyRowAfter(row, payload.collapsedGroupIds, payload.rowFieldCount)) {
      result.push(buildEmptyDataItem(row.id, payload.rowFields, payload.valueColumns))
    }
  }

  return result
}

export function pivotTransformData<T = IItem>(
  payload: IPivotTransformPayload<T>,
): IPivotTransformResult<T> {
  const {
    data,
    rows: rowFields,
    columns: columnFields,
    values: valueFields,
    state,
    collapseConfig,
    isFirstRender = ref(true),
  } = payload

  const { valueColumns, valueHeaderRows } = buildPivotValueColumns(
    data,
    columnFields,
    valueFields,
  )

  if (!data.length || !rowFields.length) {
    return {
      data: [],
      valueColumns,
      valueHeaderRows,
    }
  }

  const tabularRows = buildTabularRows(
    data,
    rowFields,
    valueColumns,
    columnFields,
  )
  const grandTotalCellKinds = rowFields.map((_, index) =>
    index === 0 ? 'grandTotal' as const : 'empty' as const,
  )

  tabularRows.push(buildDataItem(
    ['__grand_total__'],
    rowFields,
    grandTotalCellKinds,
    data,
    valueColumns,
    columnFields,
    'grandTotal',
  ))

  if (isFirstRender.value) {
    state.collapsedGroupIds = getInitialCollapsedGroupIds(
      tabularRows as IPivotDataItem[],
      collapseConfig?.expandedLevelOnInit ?? 0,
      rowFields.length,
    )
    isFirstRender.value = false
  }

  return {
    data: tabularRows,
    valueColumns,
    valueHeaderRows,
  }
}

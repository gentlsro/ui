// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'

// Functions
import { getInitialCollapsedGroupIds } from './pivot-group-collapse'
import { getInitialCollapsedColumnGroupIds } from './pivot-column-collapse'
import { pivotTransformDataCore } from './pivot-transform-data-core'

// Models
import type { PivotRow } from '../models/pivot-row.model'
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

type IPivotFormatNumber = (value: number) => string

type IPivotTransformPayload<T = IItem> = {
  data: T[]
  rows: PivotRow<T>[]
  columns: PivotColumn<T>[]
  values: PivotValue<T>[]
  state: IPivotState
  collapseConfig: IPivotProps<T>['collapseConfig']
  isFirstRender?: Ref<boolean>
  formatNumber: IPivotFormatNumber
}

type IShouldInsertPivotEmptyRowAfterPayload<T> = {
  row: IPivotDataItem<T>
  collapsedGroupIds: Set<string>
  rowFieldCount: number
}

type IBuildEmptyDataItemPayload<T> = {
  afterRowId: string
  rowFields: PivotRow<T>[]
  valueColumns: IPivotValueColumnItem<T>[]
}

function buildEmptyDataItem<T>(payload: IBuildEmptyDataItemPayload<T>): IPivotDataItem<T> {
  const { afterRowId, rowFields, valueColumns } = payload
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

export function shouldInsertPivotEmptyRowAfter<T>(payload: IShouldInsertPivotEmptyRowAfterPayload<T>) {
  const { row, collapsedGroupIds, rowFieldCount } = payload

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

    if (shouldInsertPivotEmptyRowAfter({
      row,
      collapsedGroupIds: payload.collapsedGroupIds,
      rowFieldCount: payload.rowFieldCount,
    })) {
      result.push(buildEmptyDataItem({
        afterRowId: row.id,
        rowFields: payload.rowFields,
        valueColumns: payload.valueColumns,
      }))
    }
  }

  return result
}

export function pivotTransformData<T = IItem>(
  payload: IPivotTransformPayload<T>,
): IPivotTransformResult<T> {
  const {
    rows: rowFields,
    columns: columnFields,
    state,
    collapseConfig,
    isFirstRender = ref(true),
    formatNumber,
    ...corePayload
  } = payload

  const result = pivotTransformDataCore({
    ...corePayload,
    rows: rowFields,
    columns: columnFields,
    formatNumber,
  })

  if (isFirstRender.value) {
    state.collapsedGroupIds = getInitialCollapsedGroupIds(
      result.data,
      collapseConfig?.expandedLevelOnInit ?? 0,
      rowFields.length,
    )
    state.collapsedColumnGroupIds = getInitialCollapsedColumnGroupIds(
      result.columnTree,
      collapseConfig?.expandedLevelOnInit ?? 0,
      columnFields.length,
    )
    isFirstRender.value = false
  }

  return result
}

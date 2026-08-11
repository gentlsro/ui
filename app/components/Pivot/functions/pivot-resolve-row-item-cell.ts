import { get } from 'lodash-es'

import type { IPivotRowItemCell } from '../types/pivot-row-item-cell.type'
import type { PivotItem } from '../models/pivot-item.model'
import { isRowItemCellCollapsible } from './is-row-item-cell-collapsible'
import { isPivotRowCellHiddenByCollapsedAncestor } from './pivot-group-collapse'

export function resolvePivotRowItemCell<T extends IItem>(payload: {
  item: IPivotRowItemCell<T>
  groupIds: string[]
  groupPath: string[]
  promotedLevels: number[]
  rows: PivotItem<T>[]
  collapsedGroupIds: Set<string>
  localeIso: string
  formatCellValue: (payload: {
    value: unknown
    row: T
    dataType?: PivotItem<T>['dataType']
    format?: PivotItem<T>['format']
    localeIso: string
  }) => unknown
}) {
  const {
    item,
    groupIds,
    groupPath,
    promotedLevels,
    rows,
    collapsedGroupIds,
    localeIso,
    formatCellValue,
  } = payload
  const level = item.rowFieldIndex
  const isPromoted = level !== undefined && promotedLevels.includes(level)
  const collapseGroupId = isPromoted && level !== undefined
    ? groupIds[level] ?? item.groupId
    : item.groupId
  const isCollapsible = item.kind === 'valueLabel'
    ? false
    : isRowItemCellCollapsible({
        rows,
        item: isPromoted
          ? { kind: 'rowLabel', rowFieldIndex: item.rowFieldIndex }
          : item,
      })
  const isHidden = isPivotRowCellHiddenByCollapsedAncestor(
    collapseGroupId,
    collapsedGroupIds,
  )

  let value: unknown

  if (item.kind === 'valueLabel') {
    value = item.label ?? ''
  } else if (isPromoted && level !== undefined) {
    value = groupPath[level] ?? ''
  } else if (item.kind === 'empty') {
    value = ''
  } else if (item.kind === 'grandTotal') {
    value = 'Grand Total'
  } else {
    value = get(item.ref, item.row?.field as ObjectKey<T>)
  }

  const dataType = ['empty', 'grandTotal', 'valueLabel'].includes(item.kind ?? '')
    ? undefined
    : item.row?.dataType
  const formattedValue = formatCellValue({
    value,
    row: item.ref,
    dataType,
    format: item.row?.format,
    localeIso,
  })
  const displayValue = item.kind === 'subtotal' && !isPromoted
    ? `${formattedValue} Total`
    : formattedValue
  const showContent = !isHidden && (isCollapsible || value !== '')

  return {
    collapseGroupId,
    displayValue,
    isCollapsible,
    isHidden,
    isPromoted,
    showContent,
    value,
  }
}

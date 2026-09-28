import { get } from 'lodash-es'

import type { IPivotRowItemCell } from '../types/pivot-row-item-cell.type'
import type { PivotItem } from '../models/pivot-item.model'
import { isRowItemCellCollapsible } from './is-row-item-cell-collapsible'
import { isPivotRowCellHiddenByCollapsedAncestor } from './pivot-group-collapse'
import { PIVOT_DEFAULT_LABELS } from '../constants/pivot-labels.constant'
import type { IPivotLabels } from '../constants/pivot-labels.constant'

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
  labels?: IPivotLabels
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
    labels = PIVOT_DEFAULT_LABELS,
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
    // Same source as the group's own label; the group key is not a display value (dates are keyed by timestamp)
    value = item.row ? get(item.ref, item.row.field as ObjectKey<T>) : groupPath[level] ?? ''
  } else if (item.kind === 'empty') {
    value = ''
  } else if (item.kind === 'grandTotal') {
    value = labels.grandTotal
  } else {
    value = get(item.ref, item.row?.field as ObjectKey<T>)
  }

  const dataType = !isPromoted && ['empty', 'grandTotal', 'valueLabel'].includes(item.kind ?? '')
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
    ? labels.subtotal(String(formattedValue ?? ''))
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

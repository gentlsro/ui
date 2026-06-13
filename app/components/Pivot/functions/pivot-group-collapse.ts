// Types
import type { IPivotDataItem } from '../types/pivot-data-item.type'

export function getPivotGroupId(groupPath: string[], rowFieldIndex?: number) {
  if (rowFieldIndex === undefined) {
    return groupPath.join('|')
  }

  return `${rowFieldIndex}:${groupPath.slice(0, rowFieldIndex + 1).join('|')}`
}

function isGroupHeaderRowAtLevel<T = IItem>(row: Pick<IPivotDataItem<T>, 'rowItem'>, level: number) {
  const labelCell = row.rowItem.cells.find(cell => cell.rowFieldIndex === level)

  return labelCell?.kind === 'rowLabel'
}

export function isPivotRowVisible<T = IItem>(
  row: IPivotDataItem<T>,
  collapsedGroupIds: Set<string>,
) {
  if (row.rowItem.kind === 'subtotal') {
    const subtotalCell = row.rowItem.cells.find(cell => cell.kind === 'subtotal')
    const subtotalLevel = subtotalCell?.rowFieldIndex

    if (subtotalLevel === undefined) {
      return true
    }

    for (let level = 0; level <= subtotalLevel; level++) {
      if (collapsedGroupIds.has(row.groupIds[level]!)) {
        return false
      }
    }

    return true
  }

  if (row.rowItem.kind === 'grandTotal') {
    return true
  }

  if (row.rowItem.kind !== 'data') {
    return true
  }

  for (let level = 0; level < row.groupIds.length - 1; level++) {
    if (!collapsedGroupIds.has(row.groupIds[level]!)) {
      continue
    }

    if (!isGroupHeaderRowAtLevel(row, level)) {
      return false
    }
  }

  return true
}

export function getInitialCollapsedGroupIds(
  data: IPivotDataItem[],
  expandedLevelOnInit = 0,
  rowFieldCount = 0,
) {
  const collapsed = new Set<string>()
  const lastCollapsibleLevel = rowFieldCount - 2

  if (lastCollapsibleLevel < 0 || expandedLevelOnInit > lastCollapsibleLevel) {
    return collapsed
  }

  for (const row of data) {
    for (let level = expandedLevelOnInit; level <= lastCollapsibleLevel; level++) {
      const groupId = row.groupIds[level]

      if (groupId) {
        collapsed.add(groupId)
      }
    }
  }

  return collapsed
}

export function togglePivotGroupCollapse(
  collapsedGroupIds: Set<string>,
  groupId: string,
) {
  const next = new Set(collapsedGroupIds)

  if (next.has(groupId)) {
    next.delete(groupId)
  } else {
    next.add(groupId)
  }

  return next
}

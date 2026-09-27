// Types
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import { getPivotPathId } from './pivot-path-id'

export function getPivotGroupId(groupPath: string[], rowFieldIndex?: number) {
  if (rowFieldIndex === undefined) {
    return getPivotPathId(groupPath)
  }

  return `${rowFieldIndex}:${getPivotPathId(groupPath.slice(0, rowFieldIndex + 1))}`
}

/**
 * Collapsed group ids are canonical (`<level>:<path id>`, level = path length - 1), so only the cell's own
 * ancestors need a lookup; scanning the collapsed set would cost O(cells x collapsed groups) per render
 */
export function hasCollapsedPathAncestor(payload: {
  path: string
  collapsedGroupIds: Set<string>
  idPrefix?: string
}) {
  const { path, collapsedGroupIds, idPrefix = '' } = payload

  if (!collapsedGroupIds.size) {
    return false
  }

  let level = 0
  let separatorIndex = path.indexOf('/')

  while (separatorIndex !== -1) {
    if (collapsedGroupIds.has(`${idPrefix}${level}:${path.slice(0, separatorIndex)}`)) {
      return true
    }

    level += 1
    separatorIndex = path.indexOf('/', separatorIndex + 1)
  }

  return false
}

export function isPivotRowCellHiddenByCollapsedAncestor(
  cellGroupId: string,
  collapsedGroupIds: Set<string>,
) {
  return hasCollapsedPathAncestor({
    path: cellGroupId.slice(cellGroupId.indexOf(':') + 1),
    collapsedGroupIds,
  })
}

function isPivotSummaryDataRowAtLevel<T = IItem>(
  row: IPivotDataItem<T>,
  level: number,
) {
  return row.rowItem.kind === 'data' && row.groupPath.length === level + 1
}

export function getPivotPromotedRowLabelLevels<T = IItem>(payload: {
  row: IPivotDataItem<T>
  visibleRows: IPivotDataItem<T>[]
  rowIndex: number
  collapsedGroupIds: Set<string>
  rowFieldCount: number
}) {
  const { row, visibleRows, rowIndex, collapsedGroupIds, rowFieldCount } = payload

  if (row.measureIndex !== undefined && row.measureIndex !== 0) {
    return []
  }

  const levels: number[] = []
  const lastCollapsibleLevel = rowFieldCount - 2

  if (lastCollapsibleLevel < 0) {
    return levels
  }

  for (let level = 0; level <= lastCollapsibleLevel; level++) {
    if (level >= row.groupIds.length) {
      break
    }

    const groupId = row.groupIds[level]!

    if (collapsedGroupIds.has(groupId)) {
      continue
    }

    if (isPivotSummaryDataRowAtLevel(row, level)) {
      continue
    }

    const isFirstDescendant = !visibleRows.slice(0, rowIndex).some(previous => {
      if (previous.groupIds[level] !== groupId) {
        return false
      }

      if (previous.measureIndex !== undefined && previous.measureIndex !== 0) {
        return false
      }

      return !isPivotSummaryDataRowAtLevel(previous, level)
    })

    if (isFirstDescendant) {
      levels.push(level)
    }
  }

  return levels
}

export function buildPivotPromotedRowLabelLevels<T = IItem>(payload: {
  visibleRows: IPivotDataItem<T>[]
  collapsedGroupIds: Set<string>
  rowFieldCount: number
}) {
  const { visibleRows, collapsedGroupIds, rowFieldCount } = payload
  const seenGroupIdsByLevel = Array.from({ length: rowFieldCount }, () => new Set<string>())
  const promotedLevelsByRowId = new Map<string, number[]>()
  const lastCollapsibleLevel = rowFieldCount - 2

  for (const row of visibleRows) {
    const levels: number[] = []

    promotedLevelsByRowId.set(row.id, levels)

    if (
      lastCollapsibleLevel < 0
      || (row.measureIndex !== undefined && row.measureIndex !== 0)
    ) {
      continue
    }

    for (let level = 0; level <= lastCollapsibleLevel; level++) {
      const groupId = row.groupIds[level]

      if (!groupId || collapsedGroupIds.has(groupId) || isPivotSummaryDataRowAtLevel(row, level)) {
        continue
      }

      const seenGroupIds = seenGroupIdsByLevel[level]!

      if (!seenGroupIds.has(groupId)) {
        levels.push(level)
        seenGroupIds.add(groupId)
      }
    }
  }

  return promotedLevelsByRowId
}

export function isPivotRowVisible<T = IItem>(
  row: IPivotDataItem<T>,
  collapsedGroupIds: Set<string>,
  rowFieldCount = 0,
) {
  if (row.rowItem.kind === 'subtotal') {
    const subtotalCell = row.rowItem.cells.find(cell => cell.kind === 'subtotal')
    // valuesOnRows duplicates subtotal rows per measure; only the first keeps kind 'subtotal'
    const subtotalLevel = subtotalCell?.rowFieldIndex ?? Math.max(0, row.groupPath.length - 1)

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

  const effectiveFieldCount = rowFieldCount || row.groupIds.length
  const lastCollapsibleLevel = effectiveFieldCount - 2

  if (lastCollapsibleLevel < 0) {
    return true
  }

  for (let level = 0; level <= lastCollapsibleLevel; level++) {
    if (level >= row.groupIds.length) {
      break
    }

    const groupId = row.groupIds[level]!
    const isCollapsed = collapsedGroupIds.has(groupId)
    const isSummaryAtLevel = isPivotSummaryDataRowAtLevel(row, level)

    if (isCollapsed) {
      if (!isSummaryAtLevel) {
        return false
      }
      continue
    }

    if (isSummaryAtLevel && row.groupPath.length < effectiveFieldCount) {
      return false
    }
  }

  return true
}

/**
 * The collapsible levels whose expanded group the row sits inside of (a collapsed row summarizes its own group, so
 * that level is not part of its context). A pinned row shows these group labels.
 */
export function getPivotRowContextLevels<T = IItem>(payload: {
  row: IPivotDataItem<T>
  collapsedGroupIds: Set<string>
  rowFieldCount: number
}) {
  const { row, collapsedGroupIds, rowFieldCount } = payload
  const lastLevel = Math.min(rowFieldCount - 2, row.groupPath.length - 1)
  const levels: number[] = []

  for (let level = 0; level <= lastLevel; level++) {
    const groupId = row.groupIds[level]

    if (!groupId || collapsedGroupIds.has(groupId)) {
      break
    }

    levels.push(level)
  }

  return levels
}

/**
 * Rows where the group context changes; the scroller pins the last one above the first visible row, so the pinned
 * row always shares the first visible row's context. Empty when no row is inside an expanded group.
 */
export function getPivotStickyIndices<T = IItem>(
  rows: IPivotDataItem<T>[],
  payload: {
    collapsedGroupIds: Set<string>
    rowFieldCount: number
  },
) {
  if (payload.rowFieldCount < 2) {
    return []
  }

  const indices: number[] = []
  let previousKey: string | undefined
  let hasContext = false

  rows.forEach((row, index) => {
    const levels = getPivotRowContextLevels({ row, ...payload })
    const key = levels.length ? row.groupIds[levels.at(-1)!]! : ''

    hasContext ||= key !== ''

    if (key !== previousKey) {
      indices.push(index)
      previousKey = key
    }
  })

  return hasContext ? indices : []
}

export function getInitialCollapsedGroupIds<T = IItem>(payload: {
  data: IPivotDataItem<T>[]
  expandedLevelOnInit?: number
  rowFieldCount?: number
}) {
  const {
    data,
    expandedLevelOnInit = 0,
    rowFieldCount = 0,
  } = payload
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

import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { IPivotValueItem } from '../types/pivot-value-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'
import type { PivotItem } from '../models/pivot-item.model'
import { aggregatePivotValueCellsForColumn } from './pivot-column-collapse'
import { getPivotPathId } from './pivot-path-id'

export function resolvePivotDisplayedValueItem<T extends IItem>(payload: {
  item: IPivotValueItem<T>
  collapsedGroupIds: Set<string>
}) {
  const { item, collapsedGroupIds } = payload
  const collapsedItems = item.collapsedGroupValueItems

  if (!collapsedItems) {
    return item
  }

  const groupId = item.groupIds.find(groupId => {
    return collapsedGroupIds.has(groupId) && collapsedItems[groupId]
  })

  return groupId ? collapsedItems[groupId]! : item
}

export function resolvePivotDisplayedValueCells<T extends IItem>(payload: {
  item: IPivotValueItem<T>
  visibleValueColumns: IPivotValueColumnItem<T>[]
  collapsedGroupIds: Set<string>
}) {
  const { visibleValueColumns } = payload
  const item = resolvePivotDisplayedValueItem(payload)
  const cellsByColumnId = new Map(item.cells.map(cell => [cell.columnId, cell]))

  return visibleValueColumns.map((column): IPivotValueItemCell<T> => {
    const existingCell = cellsByColumnId.get(column.id)

    if (existingCell) {
      return existingCell
    }

    if (column.isCollapsedGroupColumn) {
      const activeMeasure = item.cells[0]
      const measureId = activeMeasure?.measureId ?? column.measureId
      const groupCell = item.columnGroupCells?.[
        `${getPivotPathId(column.columnPath)}:${measureId}`
      ]

      if (groupCell) {
        return {
          ...groupCell,
          id: `${item.id}-${column.id}`,
          columnId: column.id,
        }
      }

      return aggregatePivotValueCellsForColumn<T>({
        cells: item.cells as Parameters<typeof aggregatePivotValueCellsForColumn<T>>[0]['cells'],
        column: {
          id: column.id,
          columnPath: column.columnPath,
          measureId,
          valueField: activeMeasure?.valueField ?? column.valueField as ObjectKey<T>,
          value: activeMeasure?.value ?? column.value as PivotItem<T>,
        },
      })
    }

    return {
      id: `${item.id}-${column.id}`,
      kind: item.kind,
      columnId: column.id,
      columnPath: column.columnPath,
      measureId: column.measureId,
      valueField: column.valueField,
      value: column.value,
      aggregated: 0,
      hasValue: false,
    }
  })
}

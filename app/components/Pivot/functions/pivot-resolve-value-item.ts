import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { IPivotValueItemCell } from '../types/pivot-value-item-cell.type'
import type { IPivotTransformValueField } from './pivot-transform-data-core'
import { getPivotPathId } from './pivot-path-id'

type IPivotLayoutValueField<T extends IItem> = Pick<IPivotTransformValueField<T>, 'measureId' | 'field' | 'item'>

/** Where a cell's value lives in a row's value arrays, and the measure items a cell refers to */
export type IPivotValueLayout<T extends IItem = IItem> = {
  /** Index into `valueItem.values` per value column id */
  columnIndexById: Map<string, number>
  /** Index into `valueItem.columnGroupValues` per `<column path id>:<measure id>` */
  columnGroupIndexByKey: Map<string, number>
  valueFieldById: Map<string, IPivotLayoutValueField<T>>
}

export function createPivotValueLayout<T extends IItem>(payload: {
  valueColumns: IPivotValueColumnItem<T>[]
  columnGroupKeys: string[]
  valueFields: IPivotLayoutValueField<T>[]
}): IPivotValueLayout<T> {
  return {
    columnIndexById: new Map(payload.valueColumns.map((column, index) => [column.id, index])),
    columnGroupIndexByKey: new Map(payload.columnGroupKeys.map((key, index) => [key, index])),
    valueFieldById: new Map(payload.valueFields.map(valueField => [valueField.measureId, valueField])),
  }
}

/**
 * Builds the value cells of a row for the given (rendered) columns. A row with values on rows shows its own measure
 * in every column; a collapsed column group shows the group's aggregate of that measure.
 */
export function resolvePivotDisplayedValueCells<T extends IItem>(payload: {
  row: IPivotDataItem<T>
  columns: IPivotValueColumnItem<T>[]
  layout: IPivotValueLayout<T>
}): IPivotValueItemCell<T>[] {
  const { row, columns, layout } = payload
  const { valueItem } = row

  return columns.map(column => {
    const measureId = row.activeMeasureId ?? column.measureId
    let aggregated = 0
    let hasValue = false

    if (column.isCollapsedGroupColumn) {
      const index = layout.columnGroupIndexByKey.get(`${getPivotPathId(column.columnPath)}:${measureId}`)

      if (index !== undefined && valueItem.columnGroupValues && valueItem.columnGroupHasValues) {
        aggregated = valueItem.columnGroupValues[index] ?? 0
        hasValue = valueItem.columnGroupHasValues[index] === 1
      }
    } else {
      const index = layout.columnIndexById.get(column.id)

      if (index !== undefined && valueItem.values && valueItem.hasValues) {
        aggregated = valueItem.values[index] ?? 0
        hasValue = valueItem.hasValues[index] === 1
      }
    }

    const valueField = layout.valueFieldById.get(measureId)

    return {
      id: `${valueItem.id}-${column.id}`,
      kind: valueItem.kind,
      columnId: column.id,
      columnPath: column.columnPath,
      measureId,
      valueField: valueField?.field ?? column.valueField,
      value: valueField?.item ?? column.value,
      aggregated,
      hasValue,
    }
  })
}

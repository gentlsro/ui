// Spec helper: read a transform result's values the way the UI does (cells are no longer stored on rows)
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'
import { createPivotValueLayout, resolvePivotDisplayedValueCells } from './pivot-resolve-value-item'

/** The value cells of a row over all of the result's value columns */
export function getPivotValueCells<T extends IItem>(result: IPivotTransformResult<T>, row: IPivotDataItem<T>) {
  const layout = createPivotValueLayout({
    valueColumns: result.valueColumns,
    columnGroupKeys: result.columnGroupKeys,
    valueFields: [],
  })

  return resolvePivotDisplayedValueCells({ row, columns: result.valueColumns, layout })
}

/** The collapsible column group aggregates of a row, by `<column path id>:<measure id>` */
export function getPivotColumnGroupCells<T extends IItem>(result: IPivotTransformResult<T>, row: IPivotDataItem<T>) {
  return Object.fromEntries(result.columnGroupKeys.map((key, index) => [key, {
    aggregated: row.valueItem.columnGroupValues?.[index] ?? 0,
    hasValue: row.valueItem.columnGroupHasValues?.[index] === 1,
  }]))
}

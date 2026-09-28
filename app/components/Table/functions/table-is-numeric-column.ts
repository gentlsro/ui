import type { ExtendedDataType } from '$dataType'

// Models
import type { TableColumn } from '../models/table-column.model'

// Numeric for display, on top of the configured number types (`dataTypeExtend.numberDataTypes`),
// which also drive filtering and summaries and so stay limited to plain numbers
const ALIGNED_NUMERIC_DATA_TYPES: ExtendedDataType[] = ['decimal', 'currency', 'percent']

/**
 * Numeric columns are right-aligned, so their digits line up
 */
export function tableIsNumericColumn(column: Pick<TableColumn, 'dataType'>) {
  const { dataType } = column

  if (!dataType) {
    return false
  }

  // Unlike `getDateTypes`, `getNumberDataTypes` does not add the `Simple` variants
  const numericDataTypes = getNumberDataTypes(ALIGNED_NUMERIC_DATA_TYPES)
  const baseDataType = dataType.replace(/Simple$/, '') as ExtendedDataType

  return numericDataTypes.includes(dataType) || numericDataTypes.includes(baseDataType)
}

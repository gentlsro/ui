import type { PivotRowItemKind } from './pivot-row-item.type'

/**
 * The values of one row. Cells are not stored: they are built for the rendered columns on demand
 * (`resolvePivotDisplayedValueCells`), so the transform result stays a few typed arrays per matrix that the worker
 * transfers instead of copying.
 */
export type IPivotValueItem<_T = IItem> = {
  id: string
  kind?: PivotRowItemKind
  groupIds: string[]

  /** Aggregate per value column, aligned with the transform's `valueColumns` (a view into a shared buffer) */
  values?: Float64Array

  /** 1 where the value column shows its aggregate, aligned with `values` */
  hasValues?: Uint8Array

  /** Aggregates of the collapsible column groups, aligned with the transform's `columnGroupKeys` */
  columnGroupValues?: Float64Array

  /** 1 where the column group shows its aggregate, aligned with `columnGroupValues` */
  columnGroupHasValues?: Uint8Array
}

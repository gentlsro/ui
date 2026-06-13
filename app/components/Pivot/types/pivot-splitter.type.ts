// Models
import type { PivotRow } from '../models/pivot-row.model'

export type IPivotSplitter<T = IItem> = {
  field: PivotRow<T>['field']
  left: number
  row: PivotRow<T>
}

export type IActivePivotSplitter<T = IItem> = Omit<IPivotSplitter<T>, 'row'> & {
  minLeft: number
  top: number
  height: number
  row: PivotRow<T>
  adjustedWidth: number
  originalWidth: number
}

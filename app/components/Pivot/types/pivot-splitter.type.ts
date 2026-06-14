// Models
import type { PivotItem } from '../models/pivot-item.model'

export type IPivotSplitter<T = IItem> = {
  field: PivotItem<T>['field']
  left: number
  row: PivotItem<T>
}

export type IActivePivotSplitter<T = IItem> = Omit<IPivotSplitter<T>, 'row'> & {
  minLeft: number
  top: number
  height: number
  row: PivotItem<T>
  adjustedWidth: number
  originalWidth: number
}

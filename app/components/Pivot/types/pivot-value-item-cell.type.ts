import type { PivotItem } from '../models/pivot-item.model'
import type { PivotRowItemKind } from './pivot-row-item.type'

export type IPivotValueItemCell<T = IItem> = {
  id: string
  kind?: PivotRowItemKind
  columnId: string
  columnPath: string[]
  measureId: string
  valueField: ObjectKey<T>
  value: PivotItem<T>
  aggregated: number
  hasValue: boolean
}

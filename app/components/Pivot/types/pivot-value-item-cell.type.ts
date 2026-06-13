import type { PivotValue } from '../models/pivot-value.model'
import type { PivotRowItemKind } from './pivot-row-item.type'

export type IPivotValueItemCell<T = IItem> = {
  id: string
  kind?: PivotRowItemKind
  columnId: string
  columnPath: string[]
  valueField: ObjectKey<T>
  value: PivotValue<T>
  aggregated: number
  formattedValue: string
}

// Types
import type { IPivotRowItem } from './pivot-row-item.type'
import type { IPivotValueItem } from './pivot-value-item.type'

export type IPivotDataItem<T = IItem> = {
  id: string
  label: string
  groupPath: string[]
  groupIds: string[]

  rowItem: IPivotRowItem<T>
  valueItem: IPivotValueItem<T>
}

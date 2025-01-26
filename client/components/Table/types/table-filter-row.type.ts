// Types
import type { ITableFilterGroup } from './table-filter-group'
import type { ITableFilterItem } from './table-filter-item.type'

export type ITableFilterRow<T = IItem> =
  | ITableFilterItem<T>
  | ITableFilterGroup<T>

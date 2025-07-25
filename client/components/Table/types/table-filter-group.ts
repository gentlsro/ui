import type { ITableFilterRow } from './table-filter-row.type'

export type ITableFilterGroup<T = IItem> = {
  isGroup: true
  condition: 'AND' | 'OR' | 'NOT_AND' | 'NOT_OR'
  children: ITableFilterRow<T>[]
}

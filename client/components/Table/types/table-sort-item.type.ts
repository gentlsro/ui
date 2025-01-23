import type { ObjectKey } from '$utils/shared/types/object-key.type'

export type ITableSortItem<T = IItem> = {
  field: ObjectKey<T>
  direction: 'asc' | 'desc'
  sortOrder?: number
  filterField?: ObjectKey<T>
}

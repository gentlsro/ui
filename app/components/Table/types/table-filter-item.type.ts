import type { ExtendedDataType } from '$dataType'
import type { ComparatorEnum } from '$comparatorEnum'

export type ITableFilterItem<T = IItem> = {
  field: ObjectKey<T>
  filterField?: ObjectKey<T>
  value?: any
  comparator: ComparatorEnum
  dataType?: ExtendedDataType
}

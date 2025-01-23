import type { ExtendedDataType } from '$dataType'
import type { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ObjectKey } from '$utils/shared/types/object-key.type'

export type ITableFilterItem<T = IItem> = {
  field: ObjectKey<T>
  filterField?: ObjectKey<T>
  value?: any
  comparator: ComparatorEnum
  dataType?: ExtendedDataType
}

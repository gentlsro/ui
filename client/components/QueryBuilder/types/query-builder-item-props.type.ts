import type { ComparatorEnum } from '$comparatorEnum'
import type { ExtendedDataType } from '$dataType'

// Types
import type { IQueryBuilderGroup } from './query-builder-group-props.type'
import type { IQueryBuilderRowProps } from './query-builder-row-props.type'

export type IQueryBuilderItem<T = IItem> = {
  id: string | number
  path: string
  field: ObjectKey<T>
  filterField?: ObjectKey<T>
  comparator: ComparatorEnum
  value?: any
  isNotDraggable?: boolean
  isNotDragOverable?: boolean
  dataType?: ExtendedDataType

  /**
   * The original object (reference)
   */
  ref?: T
}

export type IQueryBuilderItemProps = IQueryBuilderRowProps & {
  /**
   * The actual query builder row item
   */
  item: IQueryBuilderItem

  /**
   * The nested level
   */
  level: number

  /**
   * Whether the item is draggable
   */
  noDraggable?: boolean

  /**
   * Parent of the current item
   */
  parent?: IQueryBuilderGroup

  /**
   * Whether the current item is the first child of its parent
   */
  isFirstChild?: boolean

  /**
   * Whether the current item is the last child of its parent
   */
  isLastChild?: boolean

  /**
   * When true, the add button is not shown
   */
  noAdd?: boolean

  /**
   * When true, the remove button is not shown
   */
  noRemove?: boolean
}

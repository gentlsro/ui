// Types
import type { IQueryBuilderItem } from './query-builder-item-props.type'
import type { IQueryBuilderGroup } from './query-builder-group-props.type'

// Models
import type { TableColumn } from '../../Table/models/table-column.model'

export type IQueryBuilderRow = IQueryBuilderItem | IQueryBuilderGroup

export type IQueryBuilderRowProps = {
  /**
   * Whether the item is editable
   */
  editable?: boolean

  /**
   * The actual query builder row item
   */
  item: IQueryBuilderRow

  /**
   * The nested level
   */
  level: number

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
   * When true, the condition may not be changed
   */
  noConditionChange?: boolean

  /**
   * Custom function for modifying the item
   */
  modifyFnc?: (item: IQueryBuilderItem & { misc?: { column?: TableColumn } }) => void

  /**
   * Custom function for removing the item
   */
  removeFnc?: (item: IQueryBuilderItem & { misc?: { column?: TableColumn } }) => void
}

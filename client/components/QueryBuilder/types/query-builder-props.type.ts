// Types
import type { IQueryBuilderRow } from './query-builder-row-props.type'

// Models
import type { TableColumn } from '../../Table/models/table-column.model'
import type { ITableFilterItem } from '../../Table/types/table-filter-item.type'

export type IQueryBuilderProps = {
  /**
   * Whether multiple filters of the same comparator can be used within field filter
   */
  allowComparatorsOfSameType?: boolean

  /**
   * Whether the query builder is editable
   */
  editable?: boolean

  /**
   * The columns of the table
   */
  columns: TableColumn<any>[]

  /**
   * The actual items
   */
  items: IQueryBuilderRow[]

  /**
   * The maximum level of the query builder
   */
  maxLevel?: number

  /**
   * Whether to initialize the query builder with and empty group
   */
  noInitialization?: boolean

  /**
   * When true, the column filters will also be shown in the query builder
   */
  showColumnFilters?: boolean

  /**
   * Function to get a filter component for a column
   *
   * NOTE: TableColumn.filterComponent still takes precendence over this
   * So priority is: `TableColumn.filterComponent` > `getFilterComponent` > default input based on `dataType`
   */
  getFilterComponent?: (
    column: TableColumn<any>,
    item: ITableFilterItem
  ) => TableColumn['filterComponent'] | undefined
}

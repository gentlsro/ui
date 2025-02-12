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
   * A function that may return a component that is used in specific cases for the
   * item filter value.
   *
   * Priority of the shown filter component is:
   * `TableColumn.filterComponent` > `getFilterComponent` > default input based on `dataType`
   */
  getFilterComponent?: (
    column: TableColumn<any>,
    filterItem: ITableFilterItem
  ) => Omit<NonNullable<TableColumn['filterComponent']>, 'comparators'> | undefined
}

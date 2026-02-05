import { get } from 'lodash-es'
import type { Required } from 'utility-types'
import type { ExtendedDataType } from '$dataType'

export class BaseTableColumn<T = IItem> {
  /**
   * The field to use for the column
   */
  field: ObjectKey<T, true>

  /**
   * We might need to filter by a different field than the one displayed,
   * this property is used for that
   */
  filterField?: string

  /**
   * When true, the column will be hidden in the table
   */
  hidden?: boolean

  /**
   * When provided, the `select` will be extended with these fields
   */
  needsFields?: string[]

  /**
   * When true, the column will always be included in the `select` query
   *
   * Does not mean that it needs to be visible in the table!
   */
  alwaysSelected?: boolean

  /**
   * Function to format the value of the column
   */
  format?: (row: T, value?: any) => any

  /**
   * Function that defines how do we access a value for this column
   * for a specific row
   */
  valueGetter(row: T) {
    return get(row, this.field) as any
  }

  /**
   * The data type of the column
   */
  dataType: ExtendedDataType = 'string'

  /**
   * Label of the column
   */
  label?: string | (() => string)

  /**
   * Marks the column as searchable
   */
  searchable?: boolean

  constructor(obj: Required<Partial<BaseTableColumn<T>>, 'field'>) {
    this.field = obj.field
    this.filterField = obj.filterField
    this.dataType = obj.dataType ?? this.dataType
    this.label = obj.label
    this.alwaysSelected = obj.alwaysSelected ?? false
    this.needsFields = obj.needsFields
    this.format = obj.format
    this.searchable = obj.searchable ?? false
    this.hidden = obj.hidden ?? false
  }
}

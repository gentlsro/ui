import type { CSSProperties } from 'vue'

// Models
import type { TableColumn } from '../models/table-column.model'

export type IRowColumn = {
  id: string | number
  value: any
  valueFormatted: any
  isEditable: boolean
  column: TableColumn
  cellStyle: CSSProperties
  cellInnerStyle: CSSProperties
  cellClass: ClassType
  cellInnerClass: ClassType
  link: { to?: string } & IItem
}

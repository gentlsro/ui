// Models
import type { TableColumn } from '../models/table-column.model'

export type ITableSplitter = {
  field: TableColumn['field']
  left: number
  column: TableColumn
}

export type IActiveTableSplitter = ITableSplitter & {
  minLeft: number // ~ when dragging, it cannot go lower than this
  top: number
  height: number
  column: TableColumn
  adjustedWidth: number
  originalWidth: number
}

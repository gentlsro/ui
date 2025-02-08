// Models
import type { TableColumn } from '../models/table-column.model'

export type ITableTotal = Pick<TableColumn, 'field' | 'label'> & { value: any }

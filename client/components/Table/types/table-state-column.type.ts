import type { TableColumn } from '../models/table-column.model'

export type ITableStateColumn = Pick<TableColumn, 'field' | 'frozen' | 'hidden' | 'semiFrozen' | 'sort' | 'sortOrder' | 'width'>
  & { filters: Pick<TableColumn['filters'][0], 'comparator' | 'dataType' | 'field' | 'filterField' | 'id' | 'nonInteractive' | 'value'>[] }

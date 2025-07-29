// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableLayout } from '../types/table-layout.type'
import type { TableColumn } from '../models/table-column.model'

// Store
import type { useTableStore } from '../stores/table2.store'

export function tableOnLayoutApply(payload: {
  layout: ITableLayout
  columns: TableColumn<any>[]
  modifiers?: ITableProps['modifiers']
  getStore: () => ReturnType<typeof useTableStore>
}) {
  const {
    layout,
    columns,
    modifiers,
    getStore,
  } = payload

  return layout
}

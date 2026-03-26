export type ITableEmits = {
  (e: 'click:row', payload: { ev?: MouseEvent, row: any }): void
  (
    e: 'resize:column',
    payload: {
      column: TableColumn<any>
      columns: TableColumn<any>[]
      width: number
    }): void
}

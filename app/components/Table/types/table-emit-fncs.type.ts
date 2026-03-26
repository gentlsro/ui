export type ITableEmitFncs = {
  rowClick: (payload: { row: any, ev?: MouseEvent }) => void
  columnResize: (payload: { column: TableColumn<any>, columns: TableColumn<any>[], width: number }) => void
}

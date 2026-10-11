export type ITableEmitFncs = {
  rowClick: (payload: { row: any, ev?: MouseEvent }) => void
  columnResize: (payload: { column: TableColumn<any>, columns: TableColumn<any>[], width: number }) => void

  /** The columns chosen in the column selection, in their order */
  columnSelect: (payload: { columns: TableColumn<any>[] }) => void
}

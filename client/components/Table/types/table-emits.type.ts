export type ITableEmits = {
  (e: 'click:row', payload: { ev?: MouseEvent, row: any }): void
}

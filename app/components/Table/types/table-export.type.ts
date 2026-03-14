export type ITableExport = {
  id: string
  icon: string
  label: string | (() => string)
  fnc: (payload: {
    fileName: string
    data: IItem[]
  }) => any | Promise<any>
}

import * as XLSX from 'xlsx'

const { writeFileXLSX, utils } = XLSX

export function tableExportXlsx(payload: {
  fileName: string
  data: IItem[]
}) {
  const { fileName, data } = payload

  const wb = utils.book_new()
  const ws = utils.json_to_sheet(data)
  utils.book_append_sheet(wb, ws, 'Generated')

  writeFileXLSX(wb, `${fileName}.xlsx`)
}

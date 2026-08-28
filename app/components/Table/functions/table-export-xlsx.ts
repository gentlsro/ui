import { loadXlsx } from './load-xlsx'

export async function tableExportXlsx(payload: {
  fileName: string
  data: IItem[]
}) {
  const { fileName, data } = payload
  const { writeFileXLSX, utils } = await loadXlsx()

  const wb = utils.book_new()
  const ws = utils.json_to_sheet(data)
  utils.book_append_sheet(wb, ws, 'Generated')

  writeFileXLSX(wb, `${fileName}.xlsx`)
}

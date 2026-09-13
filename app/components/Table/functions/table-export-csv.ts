import { loadXlsx } from './load-xlsx'

export async function tableExportCsv(payload: {
  fileName: string
  data: IItem[]
}) {
  const { fileName, data } = payload
  const { writeFile, utils } = await loadXlsx()

  const wb = utils.book_new()
  const ws = utils.json_to_sheet(data)
  utils.book_append_sheet(wb, ws, 'Generated')

  writeFile(wb, `${fileName}.csv`)
}

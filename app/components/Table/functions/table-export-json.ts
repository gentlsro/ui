export function tableExportJson(payload: {
  fileName: string
  data: IItem[]
}) {
  const { fileName, data } = payload

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.json`
  a.click()

  URL.revokeObjectURL(url)
}

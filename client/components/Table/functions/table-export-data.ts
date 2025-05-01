import * as XLSX from 'xlsx'
import { parseValue } from '$utils'

// Models
import type { TableColumn } from '../models/table-column.model'

const { writeFile, writeFileXLSX, utils } = XLSX

export async function tableExportData(payload: {
  rows: IItem[]
  columns: TableColumn[]
  format?: 'xlsx' | 'csv' | 'json'
  filename?: string | (() => string)
}) {
  const {
    rows,
    columns,
    format = 'xlsx',
    filename = `data-${$date(undefined, { utc: false }).format('YYYY-MM-DD HH:mm:ss')}`,
  } = payload

  const data = rows.map(row => {
    const rowData: any = {}

    columns.forEach(col => {
      const colValueRaw = col.valueGetter(row)
      const colValue = col.format?.(row, colValueRaw)
        ?? parseValue(colValueRaw, col.dataType, { dateFormat: 'YYYY-MM-DD HH:mm:ss' })
        ?? colValueRaw

      const colLabel = col._label || col.field

      rowData[colLabel] = colValue
    })

    return rowData
  })

  const fileName = typeof filename === 'function' ? filename() : filename

  // XLSX
  if (format === 'xlsx') {
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(data)
    utils.book_append_sheet(wb, ws, 'Generated')

    writeFileXLSX(wb, `${fileName}.xlsx`)
  }

  // CSV
  else if (format === 'csv') {
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(data)
    utils.book_append_sheet(wb, ws, 'Generated')

    writeFile(wb, `${fileName}.csv`)
  }

  // JSON
  else if (format === 'json') {
    const jsonString = JSON.stringify(data)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.json`
    a.click()

    URL.revokeObjectURL(url)
  }
}

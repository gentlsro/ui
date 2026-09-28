import type { Range } from 'xlsx'

import type {
  IPivotCurrentViewExport,
  PivotExportFormat,
} from '../types/pivot-export.type'
import { tableExportCsv } from '../../Table/functions/table-export-csv'
import { tableExportJson } from '../../Table/functions/table-export-json'
import { tableExportXlsx } from '../../Table/functions/table-export-xlsx'
import { loadXlsx } from '../../Table/functions/load-xlsx'

export async function buildPivotCurrentViewSheet(payload: IPivotCurrentViewExport) {
  const { utils } = await loadXlsx()
  const headerRowCount = Math.max(payload.valueHeaders.length, 1)
  const rowHeaderCount = payload.rowHeaders.length
  const sheetRows: unknown[][] = Array.from(
    { length: headerRowCount },
    () => [],
  )
  const merges: Range[] = []

  payload.rowHeaders.forEach((header, index) => {
    sheetRows[0]![index] = header.label

    if (headerRowCount > 1) {
      merges.push({
        s: { r: 0, c: index },
        e: { r: headerRowCount - 1, c: index },
      })
    }
  })

  const occupied = Array.from(
    { length: headerRowCount },
    () => Array.from({ length: payload.columns.length }).fill(false),
  )

  payload.valueHeaders.forEach((headerRow, rowIndex) => {
    let columnIndex = 0

    for (const cell of headerRow) {
      while (columnIndex < payload.columns.length && occupied[rowIndex]![columnIndex]) {
        columnIndex++
      }

      sheetRows[rowIndex]![rowHeaderCount + columnIndex] = cell.label

      const endRow = Math.min(rowIndex + cell.rowspan, headerRowCount) - 1
      const endColumn = Math.min(columnIndex + cell.colspan, payload.columns.length) - 1

      if (endRow > rowIndex || endColumn > columnIndex) {
        merges.push({
          s: { r: rowIndex, c: rowHeaderCount + columnIndex },
          e: { r: endRow, c: rowHeaderCount + endColumn },
        })
      }

      for (let row = rowIndex; row <= endRow; row++) {
        for (let column = columnIndex; column <= endColumn; column++) {
          occupied[row]![column] = true
        }
      }

      columnIndex += cell.colspan
    }
  })

  sheetRows.push(...payload.rows.map(row => [
    ...row.rowHeaders,
    ...row.values,
  ]))

  const sheet = utils.aoa_to_sheet(sheetRows)
  sheet['!merges'] = merges

  return sheet
}

async function exportPivotCurrentViewXlsx(payload: {
  fileName: string
  data: IPivotCurrentViewExport
}) {
  const { utils, writeFile } = await loadXlsx()
  const workbook = utils.book_new()
  const sheet = await buildPivotCurrentViewSheet(payload.data)

  utils.book_append_sheet(workbook, sheet, 'Generated')
  writeFile(workbook, `${payload.fileName}.xlsx`)
}

async function exportPivotCurrentViewCsv(payload: {
  fileName: string
  data: IPivotCurrentViewExport
}) {
  const { utils, writeFile } = await loadXlsx()
  const header = [
    ...payload.data.rowHeaders.map(item => item.label),
    ...payload.data.columns.map(column => column.label),
  ]
  const rows = payload.data.rows.map(row => [
    ...row.rowHeaders,
    ...row.values,
  ])
  const workbook = utils.book_new()
  const sheet = utils.aoa_to_sheet([header, ...rows])

  utils.book_append_sheet(workbook, sheet, 'Generated')
  writeFile(workbook, `${payload.fileName}.csv`)
}

function exportPivotCurrentViewJson(payload: {
  fileName: string
  data: IPivotCurrentViewExport
}) {
  const jsonString = JSON.stringify(payload.data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `${payload.fileName}.json`
  anchor.click()

  URL.revokeObjectURL(url)
}

export function exportPivotData<T extends IItem>(payload: {
  fileName: string
  format: PivotExportFormat
  raw: boolean
  rawData: T[]
  currentView?: IPivotCurrentViewExport
}) {
  const { fileName, format, raw, rawData, currentView } = payload

  if (raw) {
    const rawPayload = { fileName, data: rawData }

    if (format === 'xlsx') {
      return tableExportXlsx(rawPayload)
    }

    if (format === 'csv') {
      return tableExportCsv(rawPayload)
    }

    return tableExportJson(rawPayload)
  }

  if (!currentView) {
    throw new Error('Current Pivot view is required for a transformed export')
  }

  const currentViewPayload = { fileName, data: currentView }

  if (format === 'xlsx') {
    return exportPivotCurrentViewXlsx(currentViewPayload)
  }

  if (format === 'csv') {
    return exportPivotCurrentViewCsv(currentViewPayload)
  }

  return exportPivotCurrentViewJson(currentViewPayload)
}

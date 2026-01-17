// Types
import type { ITableExport } from '../types/table-export.type'

// Models
import type { TableColumn } from '../models/table-column.model'

export async function tableExportData(payload: {
  rows: IItem[]
  columns: TableColumn[]
  filename?: string | (() => string)
  exportDefinition: ITableExport
}) {
  const {
    rows,
    columns,
    filename = `data-${$date(undefined, { utc: false }).format('YYYY-MM-DD HH:mm:ss')}`,
    exportDefinition,
  } = payload

  const fileName = typeof filename === 'function' ? filename() : filename
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

  return exportDefinition.fnc({ fileName, data })
}

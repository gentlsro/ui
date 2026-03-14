// @unocss-include

// Types
import type { ITableExport } from '../types/table-export.type'

// Functions
import { tableExportXlsx } from '../functions/table-export-xlsx'
import { tableExportCsv } from '../functions/table-export-csv'
import { tableExportJson } from '../functions/table-export-json'

export const TABLE_EXPORTS_DEFAULT = [
  // XLSX
  {
    id: 'xlsx',
    icon: 'i-vscode-icons:file-type-excel',
    label: () => $t('mimetype.excel'),
    fnc: tableExportXlsx,
  },

  // CSV
  {
    id: 'csv',
    icon: 'i-hugeicons:csv-02',
    label: () => $t('mimetype.csv'),
    fnc: tableExportCsv,
  },

  // JSON
  {
    id: 'json',
    icon: 'i-bi:filetype-json',
    label: () => $t('mimetype.json'),
    fnc: tableExportJson,
  },
] as ITableExport[]

import type { ITableExport } from '../types/table-export.type'

import { TABLE_EXPORTS_DEFAULT } from '../constants/table-exports-default.constant'

export function tableResolveExportData(exportData?: ITableExport[] | null) {
  return exportData?.length ? exportData : TABLE_EXPORTS_DEFAULT
}

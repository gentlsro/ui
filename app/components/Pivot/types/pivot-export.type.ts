import type { PivotRowItemKind } from './pivot-row-item.type'

export type PivotExportFormat = 'xlsx' | 'csv' | 'json'

export type IPivotExportRowHeader = {
  field: string
  label: string
}

export type IPivotExportValueHeader = {
  label: string
  colspan: number
  rowspan: number
  level: number
}

export type IPivotExportColumn = {
  label: string
  columnPath: string[]
  measureId: string
  valueField: string
  isGrandTotal: boolean
  isCollapsedGroupColumn: boolean
}

export type IPivotExportRow = {
  kind: PivotRowItemKind
  rowHeaders: unknown[]
  values: Array<number | null>
}

export type IPivotCurrentViewExport = {
  rowHeaders: IPivotExportRowHeader[]
  valueHeaders: IPivotExportValueHeader[][]
  columns: IPivotExportColumn[]
  rows: IPivotExportRow[]
}

import type { PivotValue } from '../models/pivot-value.model'

export type IPivotValueColumnItem<T = IItem> = {
  id: string
  columnPath: string[]
  valueField: ObjectKey<T>
  value: PivotValue<T>
  label: string
  isGrandTotal?: boolean
  width: string
}

export type IPivotValueHeaderCell = {
  id: string
  label: string
  colspan: number
  rowspan: number
  level: number
  width?: string
}

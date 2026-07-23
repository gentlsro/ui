import type { PivotItem } from '../models/pivot-item.model'

export type IPivotValueColumnItem<T = IItem> = {
  id: string
  columnPath: string[]
  valueField: ObjectKey<T>
  value: PivotItem<T>
  label: string
  isGrandTotal?: boolean
  isCollapsedGroupColumn?: boolean
  width: string
}

export type IPivotValueHeaderCell = {
  id: string
  label: string
  colspan: number
  rowspan: number
  level: number
  width?: string
  groupId?: string
  columnFieldIndex?: number
}

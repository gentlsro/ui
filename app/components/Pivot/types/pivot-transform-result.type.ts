import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { IPivotColumnTreeNode } from '../functions/pivot-column-collapse'
import type { IPivotTransformEstimate } from './pivot-transform-estimate.type'

export type IPivotTransformResult<T = IItem> = {
  data: IPivotDataItem<T>[]
  valueColumns: IPivotValueColumnItem<T>[]
  valueHeaderRows: IPivotValueHeaderCell[][]
  columnTree: IPivotColumnTreeNode[]

  /** `<column path id>:<measure id>` of each collapsible column group aggregate, aligned with `columnGroupValues` */
  columnGroupKeys: string[]
  estimate: IPivotTransformEstimate
}

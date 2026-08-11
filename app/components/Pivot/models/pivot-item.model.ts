import type { ExtendedDataType } from '$dataType'
import type { Required } from 'utility-types'

// Models
import type { ComparatorEnum } from '$comparatorEnum'
import type { TableColumn } from '../../Table/models/table-column.model'

export type IPivotValueUsageSlot<T = IItem> = {
  id?: string
  index: number
  summaryType?: SummaryEnum
  summaryFormat?: (row: T) => number
}

export class PivotItem<T = IItem> {
  field: ObjectKey<T>
  label?: string | ((value: PivotItem<T>) => string)
  dataType: ExtendedDataType
  minWidth: number = 100
  resizable = true

  /**
   * Function to format the value of the item
   * Usage: Same semantics as `TableColumn.format`
   */
  format?: TableColumn<T>['format']

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: Same semantics as `TableColumn.getDistinctData`
   */
  getDistinctData?: TableColumn<T>['getDistinctData']

  /**
   * The initial / default comparator when adding a filter
   * Usage: Same semantics as `TableColumn.comparator`
   */
  comparator?: ComparatorEnum

  /**
   * If used, these will be the only available comparators
   * Usage: Same semantics as `TableColumn.comparators`
   */
  comparators?: ComparatorEnum[]

  /**
   * Usage of the item
   *
   *  - `row` ~ can only be used once, we track its index
   *  - `column` ~ can be used once, we track its index
   *  - `value`~  can be used multiple times, we track its index
   *  - `filter` ~ can be used multiple times, we track its index
   */
  usage: {
    row?: { index: number }
    column?: { index: number }
    value?: IPivotValueUsageSlot<T>[]
    filter?: {
      index: number
      comparator: ComparatorEnum
      filterValue?: any
    }[]
  } = {}

  /**
   * The initial width of the row (currently only supports `px` units)
   */
  width: string

  /**
   * The "resolved" width that is applied to the row item cell
   */
  widthResolved: string = '200px'

  /**
   * Returns the width of the row column in px
   *
   * NOTE: Do not set this manually
   */
  _width: number = 0

  get _label() {
    return typeof this.label === 'function'
      ? this.label(this)
      : this.label ?? String(this.field)
  }

  getWidth(root?: ParentNode | null) {
    const scope = root ?? (typeof document !== 'undefined' ? document : null)

    if (!scope?.querySelector) {
      return 0
    }

    const el = scope.querySelector(`[data-pivot-row="${String(this.field)}"]`)

    if (!el) {
      return 0
    }

    const width = getComputedStyle(el).getPropertyValue('width')

    return Number(stringToFloat(width) || 0)
  }

  getWidthPx(root?: ParentNode | null) {
    const measured = this.getWidth(root)

    if (measured > 0) {
      return measured
    }

    const fromConfig = Number(stringToFloat(this.widthResolved) || 0)

    if (fromConfig > 0) {
      return fromConfig
    }

    return this.minWidth
  }

  setResizedWidth(widthPx: number) {
    if (!Number.isFinite(widthPx)) {
      return
    }

    const width = `${widthPx}px`

    this.width = width
    this.widthResolved = width
    this._width = widthPx
  }

  setWidthAdjusted(payload: {
    containerWidth: number
    totalAbsoluteWidth: number
  }) {
    const { containerWidth, totalAbsoluteWidth } = payload

    const isRelative = this.width.endsWith('%')

    if (isRelative) {
      const percentage = Number.parseFloat(this.width)
      const width = Math.max(
        ((containerWidth - totalAbsoluteWidth) / 100) * percentage,
        this.minWidth,
      )

      this.widthResolved = `${width}px`
    } else {
      this.widthResolved = this.width
    }
  }

  constructor(obj: Required<Partial<PivotItem<T>>, 'field'>) {
    this.field = obj.field
    this.label = obj.label
    this.dataType = obj.dataType ?? 'string'
    this.format = obj.format
    this.getDistinctData = obj.getDistinctData
    this.comparator = obj.comparator
    this.comparators = obj.comparators

    // Width
    this.width = obj.width ?? '200px'
    this.minWidth = obj.minWidth ?? 100
    this.resizable = obj.resizable ?? this.resizable
    this._width = Math.max(this.minWidth, Number(stringToFloat(this.width) || 0))

    if (!this.width.endsWith('%')) {
      this.widthResolved = this.width
    }

    // Usage
    this.usage = obj.usage ?? {}
  }
}

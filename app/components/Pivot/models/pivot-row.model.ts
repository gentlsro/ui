import type { ExtendedDataType } from '$dataType'
import type { Required } from 'utility-types'

export class PivotRow<T = IItem> {
  field: ObjectKey<T>
  label?: string | ((value: PivotRow<T>) => string)
  dataType: ExtendedDataType
  minWidth: number = 100
  resizable = true

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
      : String(this.field)
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

  constructor(obj: Required<Partial<PivotRow<T>>, 'field'>) {
    this.field = obj.field
    this.label = obj.label
    this.dataType = obj.dataType ?? 'string'

    // Width
    this.width = obj.width ?? '200px'
    this.minWidth = obj.minWidth ?? 100
    this.resizable = obj.resizable ?? this.resizable

    if (!this.width.endsWith('%')) {
      this.widthResolved = this.width
    }
  }
}

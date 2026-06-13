import type { Required } from 'utility-types'

export class PivotColumn<T = IItem> {
  field: ObjectKey<T>
  label?: string | ((value: PivotColumn<T>) => string)
  minWidth: number = 80
  width: string = '100px'
  widthResolved: string = '100px'

  get _label() {
    return typeof this.label === 'function'
      ? this.label(this)
      : (this.label ?? String(this.field))
  }

  constructor(obj: Required<Partial<PivotColumn<T>>, 'field'>) {
    this.field = obj.field
    this.label = obj.label
    this.minWidth = obj.minWidth ?? 80
    this.width = obj.width ?? '100px'
    this.widthResolved = obj.widthResolved ?? this.width
  }
}

import type { ExtendedDataType } from '$dataType'
import type { Required } from 'utility-types'

// Models
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'

export class PivotValue<T = IItem> {
  field: ObjectKey<T>
  label?: string | ((value: PivotValue<T>) => string)
  summaryFormat?: (row: T) => number
  summaryType: SummaryEnum = SummaryEnum.SUM
  dataType: ExtendedDataType = 'number'
  minWidth: number = 80
  width: string = '100px'
  widthResolved: string = '100px'

  get _label() {
    return typeof this.label === 'function'
      ? this.label(this)
      : (this.label ?? String(this.field))
  }

  constructor(obj: Required<Partial<PivotValue<T>>, 'field'>) {
    this.field = obj.field
    this.label = obj.label
    this.summaryFormat = obj.summaryFormat
    this.summaryType = obj.summaryType ?? SummaryEnum.SUM
    this.dataType = obj.dataType ?? 'number'
    this.minWidth = obj.minWidth ?? 80
    this.width = obj.width ?? '100px'
    this.widthResolved = obj.widthResolved ?? this.width
  }
}

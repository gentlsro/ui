import type { Required } from 'utility-types'

export class PivotFilter<T = IItem> {
  field: ObjectKey<T>

  constructor(obj: Required<Partial<PivotFilter<T>>, 'field'>) {
    this.field = obj.field
  }
}

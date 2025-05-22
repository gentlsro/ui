// Types
import type { IFieldProps } from '../../Field/types/field-props.type'

export type IYearMonthSelectorProps = IFieldProps & {
  clearable?: boolean
  emptyValue?: any
  modelValue?: Datetime
  utc?: boolean
}

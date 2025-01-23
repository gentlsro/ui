// Types
import type { IFieldProps } from './field-props.type'
import type { IValueFormatterProps } from '../../ValueFormatter/types/value-formatter-props.type'

export type IFieldWithFormatterProps = {}
  & IFieldProps
  & Omit<IValueFormatterProps, 'value'>

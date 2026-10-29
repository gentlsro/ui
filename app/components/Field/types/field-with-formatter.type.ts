import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
// Types
import type { IFieldProps } from './field-props.type'
import type { IValueFormatterProps } from '../../ValueFormatter/types/value-formatter-props.type'

export type IFieldWithFormatterProps = {}
  & Omit<IFieldProps, 'ui'>
  & Omit<Omit<IValueFormatterProps, 'value'>, 'ui'> & { ui?: UIClasses<NonNullable<(IFieldProps)['ui']> & NonNullable<(Omit<IValueFormatterProps, 'value'>)['ui']>, UIResolvedClasses['fieldWithFormatter']> }

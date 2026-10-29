import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { IFieldProps } from '../../Field/types/field-props.type'

export type YearMonthValueFormat = 'timestamp' | 'year-month'

export type IYearMonthSelectorProps = IFieldProps & {
  clearable?: boolean
  emptyValue?: any
  modelValue?: Datetime
  utc?: boolean
  valueFormat?: YearMonthValueFormat

  /**
   * Visual configuration
   */
  ui?: IFieldProps['ui'] & {
    /**
     * Class to apply to the picker icon
     */
    pickerIconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['yearMonthSelector']['pickerIconClass']>
    }) => ClassType

    /**
     * Style to apply to the picker icon
     */
    pickerIconStyle?: () => CSSProperties
  }
}

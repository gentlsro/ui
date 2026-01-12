import type { CSSProperties } from 'vue'

// Types
import type { IFieldProps } from '../../Field/types/field-props.type'

// Constants
import type { YEAR_MONTH_SELECTOR_DEFAULT_PROPS } from '../constants/year-month-selector-default-props.constant'

export type IYearMonthSelectorProps = IFieldProps & {
  clearable?: boolean
  emptyValue?: any
  modelValue?: Datetime
  utc?: boolean

  /**
   * Visual configuration
   */
  ui?: IFieldProps['ui'] & {
    /**
     * Class to apply to the picker icon
     */
    pickerIconClass?: (payload: {
      defaults: ReturnType<typeof YEAR_MONTH_SELECTOR_DEFAULT_PROPS['ui']['pickerIconClass']>
    }) => ClassType

    /**
     * Style to apply to the picker icon
     */
    pickerIconStyle?: () => CSSProperties
  }
}

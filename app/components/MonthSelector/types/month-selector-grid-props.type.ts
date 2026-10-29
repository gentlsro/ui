import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IMonthSelectorGridProps = {
  /**
   * Model value (datetime)
   */
  modelValue: Datetime

  /**
   * Whether to use UTC
   */
  utc?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelectorGrid']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each month button
     */
    monthBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelectorGrid']['monthBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each month button
     */
    monthBtnStyle?: () => CSSProperties
  }
}

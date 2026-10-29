import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IMonthSelectorProps = {
  /**
   * Model value (datetime)
   */
  modelValue?: Datetime

  /**
   * Reference target for menu positioning
   */
  referenceTarget?: any

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
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the previous button
     */
    previousBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['previousBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the previous button
     */
    previousBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the current month button
     */
    currentBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['currentBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the current month button
     */
    currentBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the next button
     */
    nextBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['nextBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the next button
     */
    nextBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the grid container in the menu
     */
    gridContainerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['gridContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the grid container in the menu
     */
    gridContainerStyle?: () => CSSProperties

    /**
     * Class to apply to each month button in the grid
     */
    monthBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['monthSelector']['monthBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each month button in the grid
     */
    monthBtnStyle?: () => CSSProperties
  }
}

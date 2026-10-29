import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IYearSelectorProps = {
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
      defaults: UIClassPicker<UIResolvedClasses['yearSelector']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the previous button
     */
    previousBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['yearSelector']['previousBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the previous button
     */
    previousBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the next button
     */
    nextBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['yearSelector']['nextBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the next button
     */
    nextBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the menu container
     */
    menuContainerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['yearSelector']['menuContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the menu container
     */
    menuContainerStyle?: () => CSSProperties

    /**
     * Class to apply to each year button
     */
    yearBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['yearSelector']['yearBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each year button
     */
    yearBtnStyle?: () => CSSProperties
  }
}

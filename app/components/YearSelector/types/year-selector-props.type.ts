import type { CSSProperties } from 'vue'

// Constants
import type { YEAR_SELECTOR_DEFAULT_PROPS } from '../constants/year-selector-default-props.constant'

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
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof YEAR_SELECTOR_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the previous button
     */
    previousBtnClass?: (payload: {
      defaults: ReturnType<typeof YEAR_SELECTOR_DEFAULT_PROPS['ui']['previousBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the previous button
     */
    previousBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the next button
     */
    nextBtnClass?: (payload: {
      defaults: ReturnType<typeof YEAR_SELECTOR_DEFAULT_PROPS['ui']['nextBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the next button
     */
    nextBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the menu container
     */
    menuContainerClass?: (payload: {
      defaults: ReturnType<typeof YEAR_SELECTOR_DEFAULT_PROPS['ui']['menuContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the menu container
     */
    menuContainerStyle?: () => CSSProperties

    /**
     * Class to apply to each year button
     */
    yearBtnClass?: (payload: {
      defaults: ReturnType<typeof YEAR_SELECTOR_DEFAULT_PROPS['ui']['yearBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each year button
     */
    yearBtnStyle?: () => CSSProperties
  }
}

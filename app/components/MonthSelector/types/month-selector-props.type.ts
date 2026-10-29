import type { CSSProperties } from 'vue'

// Constants
import type { MONTH_SELECTOR_DEFAULT_PROPS } from '../constants/month-selector-default-props.constant'

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
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the previous button
     */
    previousBtnClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['previousBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the previous button
     */
    previousBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the current month button
     */
    currentBtnClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['currentBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the current month button
     */
    currentBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the next button
     */
    nextBtnClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['nextBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the next button
     */
    nextBtnStyle?: () => CSSProperties

    /**
     * Class to apply to the grid container in the menu
     */
    gridContainerClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['gridContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the grid container in the menu
     */
    gridContainerStyle?: () => CSSProperties

    /**
     * Class to apply to each month button in the grid
     */
    monthBtnClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_DEFAULT_PROPS['ui']['monthBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each month button in the grid
     */
    monthBtnStyle?: () => CSSProperties
  }
}

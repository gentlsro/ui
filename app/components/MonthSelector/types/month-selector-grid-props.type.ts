import type { CSSProperties } from 'vue'

// Constants
import type { MONTH_SELECTOR_GRID_DEFAULT_PROPS } from '../constants/month-selector-grid-default-props.constant'

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
      defaults: ReturnType<typeof MONTH_SELECTOR_GRID_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each month button
     */
    monthBtnClass?: (payload: {
      defaults: ReturnType<typeof MONTH_SELECTOR_GRID_DEFAULT_PROPS['ui']['monthBtnClass']>
    }) => ClassType

    /**
     * Style to apply to each month button
     */
    monthBtnStyle?: () => CSSProperties
  }
}


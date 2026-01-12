import type { CSSProperties } from 'vue'
import type { Dayjs } from 'dayjs'

// Types
import type { DayEvent } from './DayEvent.type'

// Constants
import type { DATE_PICKER_DEFAULT_PROPS } from '../constants/datepicker-default-props.constant'

// Models
import type { DayEnum } from '#layers/utilities/shared/enums/day.enum'

export type IDatePickerProps = {
  /**
   * Days that are allowed to be selected
   */
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

  /**
   * Days that are disabled
   */
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

  /**
   * Events for given days
   */
  events?: DayEvent[]

  /**
   * Days that are excluded
   *
   * Use-case: No weekends
   */
  excludedDays?: DayEnum[]

  /**
   * Model value
   */
  modelValue?: Datetime | Datetime[]

  /**
   * Whether to allow multiple selection
   */
  multi?: boolean

  /**
   * When true, the date picker will not show `Today` button
   */
  noControls?: boolean

  /**
   * Whether to show shortcuts
   */
  shortcuts?: boolean

  /**
   * Whether to use UTC time
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
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the days grid
     */
    daysGridClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['daysGridClass']>
    }) => ClassType

    /**
     * Style to apply to the days grid
     */
    daysGridStyle?: () => CSSProperties

    /**
     * Class to apply to the controls
     */
    controlsClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['controlsClass']>
    }) => ClassType

    /**
     * Style to apply to the controls
     */
    controlsStyle?: () => CSSProperties
  }
}

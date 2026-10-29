import type { CSSProperties } from 'vue'

// Types
import type { DayEvent } from './DayEvent.type'

// Constants
import type { DATE_PICKER_DEFAULT_PROPS } from '../constants/datepicker-default-props.constant'

// Models
import type { Day } from '#layers/utilities/app/models/day.model'
import type { DayEnum } from '#layers/utilities/app/enums/day.enum'

export type DatePickerDayState = {
  day: Day
  isSelected?: boolean
  disabled?: boolean
}

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
    dayClass?: (payload: DatePickerDayState & {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayClass']>
    }) => ClassType
    dayStyle?: () => CSSProperties

    dayNumberClass?: (payload: DatePickerDayState & {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayNumberClass']>
    }) => ClassType
    dayNumberStyle?: () => CSSProperties

    dayEdgeClass?: (payload: DatePickerDayState & {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayEdgeClass']>
    }) => ClassType
    dayEdgeStyle?: () => CSSProperties

    dayNumberWrapperClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayNumberWrapperClass']>
    }) => ClassType
    dayNumberWrapperStyle?: () => CSSProperties

    dayEventsClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayEventsClass']>
    }) => ClassType
    dayEventsStyle?: () => CSSProperties

    dayEventsContainerClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayEventsContainerClass']>
    }) => ClassType
    dayEventsContainerStyle?: () => CSSProperties

    dayEventClass?: (payload: {
      defaults: ReturnType<typeof DATE_PICKER_DEFAULT_PROPS['ui']['dayEventClass']>
    }) => ClassType
    dayEventStyle?: () => CSSProperties

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

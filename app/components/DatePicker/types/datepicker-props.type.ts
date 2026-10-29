import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { DayEvent } from './DayEvent.type'

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
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayClass']>
    }) => ClassType
    dayStyle?: () => CSSProperties

    dayNumberClass?: (payload: DatePickerDayState & {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayNumberClass']>
    }) => ClassType
    dayNumberStyle?: () => CSSProperties

    dayEdgeClass?: (payload: DatePickerDayState & {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayEdgeClass']>
    }) => ClassType
    dayEdgeStyle?: () => CSSProperties

    dayNumberWrapperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayNumberWrapperClass']>
    }) => ClassType
    dayNumberWrapperStyle?: () => CSSProperties

    dayEventsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayEventsClass']>
    }) => ClassType
    dayEventsStyle?: () => CSSProperties

    dayEventsContainerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayEventsContainerClass']>
    }) => ClassType
    dayEventsContainerStyle?: () => CSSProperties

    dayEventClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['dayEventClass']>
    }) => ClassType
    dayEventStyle?: () => CSSProperties

    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the days grid
     */
    daysGridClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['daysGridClass']>
    }) => ClassType

    /**
     * Style to apply to the days grid
     */
    daysGridStyle?: () => CSSProperties

    /**
     * Class to apply to the controls
     */
    controlsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['datePicker']['controlsClass']>
    }) => ClassType

    /**
     * Style to apply to the controls
     */
    controlsStyle?: () => CSSProperties
  }
}

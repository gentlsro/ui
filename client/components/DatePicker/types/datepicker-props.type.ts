import type { Dayjs } from 'dayjs'

// Types
import type { DayEvent } from './DayEvent.type'

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
}

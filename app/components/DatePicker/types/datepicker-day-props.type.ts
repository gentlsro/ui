import type { IDatePickerProps } from './datepicker-props.type'

// Types
import type { Day } from '#layers/utilities/app/models/day.model'

// Models
import type { DayEvent } from './DayEvent.type'

export type IDatePickerDayProps = {
  ui?: IDatePickerProps['ui']
  day: Day
  isSelected?: boolean
  isBottomRow?: boolean
  events?: Array<string | DayEvent>
  edge?: boolean
  disabled?: boolean
  utc?: boolean
}

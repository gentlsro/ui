// Types
import type { Day } from '$utils/shared/models/day.model'

// Models
import type { DayEvent } from './DayEvent.type'

export type IDatePickerDayProps = {
  day: Day
  isSelected?: boolean
  isBottomRow?: boolean
  events?: Array<string | DayEvent>
  edge?: boolean
  disabled?: boolean
}

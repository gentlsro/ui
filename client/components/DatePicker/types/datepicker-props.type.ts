import type { Dayjs } from 'dayjs'

// Types
import type { DayEvent } from './DayEvent.type'

// Models
import type { DayEnum } from '$utilsLayer/shared/enums/day.enum'

export type IDatePickerProps = {
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)
  events?: DayEvent[]
  excludedDays?: DayEnum[]
  modelValue?: Datetime
  noControls?: boolean
  shortcuts?: boolean
}

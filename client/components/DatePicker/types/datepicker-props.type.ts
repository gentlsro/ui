import type dayjs from 'dayjs'

// Types
import type { DayEvent } from './DayEvent.type'

// Models
import type { DayEnum } from '$utils/shared/enums/day.enum'

export type IDatePickerProps = {
  allowedDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)
  disabledDays?: Array<dayjs.Dayjs> | ((date: dayjs.Dayjs) => boolean)
  events?: DayEvent[]
  excludedDays?: DayEnum[]
  modelValue?: Datetime
  noControls?: boolean
  shortcuts?: boolean
}

import type { Dayjs } from '$utils'

// Types
import type { IInputProps } from '../../types/input-props.type'

export type IDateInputProps = IInputProps & {
  /**
   * An array or method that determines which days are allowed to be selected
   */
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

  /**
   * Whether the calendar should automatically close when a date is selected
   *
   * @default true
   */
  autoClose?: boolean

  /**
   * An array or method that determines which days are disabled
   */
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

  /**
   * Date format that we expect the input to return
   */
  format?: string

  /**
   * Whether to hide the picker icon
   */
  noPickerIcon?: boolean

  /**
   * Whether the date should be in UTC
   *
   * NOTE: This will not modify the actual value => only affects the display value
   */
  utc?: boolean
}

// Types
import type { IInputProps } from '../../types/input-props.type'

export type IDateTimeFullInputProps = IInputProps & {
  /**
   * An array or method that determines which days are allowed to be selected
   */
  allowedDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

  /**
   * Whether the picker closes once a day is selected.
   *
   * On a narrow viewport the picker stays open so the time can be picked in its
   * own tab – pass `true` to close it there as well.
   */
  autoClose?: boolean

  /**
   * An array or method that determines which days are disabled
   */
  disabledDays?: Array<Dayjs> | ((date: Dayjs) => boolean)

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

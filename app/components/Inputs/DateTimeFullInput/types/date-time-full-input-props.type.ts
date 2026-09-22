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
   * The picker stays open by default. A narrow viewport switches to the time
   * tab; a wider one moves the caret to the time in the input. Pass `true` to
   * close the picker instead.
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

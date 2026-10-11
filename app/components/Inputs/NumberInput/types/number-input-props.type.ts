// Types
import type { IInputProps } from '../../types/input-props.type'

export type INumberInputProps = IInputProps & {
  /**
   * The number of decimal places to display
   */
  fractionDigits?: number

  /**
   * The minimum value
   */
  min?: number

  /**
   * The maximum value
   */
  max?: number

  /**
   * Whether the number should use grouping separators
   */
  noGrouping?: boolean

  /**
   * Keep the number exactly as stored: no rounding to `fractionDigits`, no thousands grouping and `.` as the decimal
   * separator in every locale. Use it for raw data (JSON, configuration) rather than amounts shown to people
   */
  exact?: boolean

  /**
   * The step to increment/decrement the value by
   *
   * NOTE - use `null` to remove the step
   */
  step?: number | 'auto' | null
}

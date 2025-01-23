import type { CSSProperties } from 'vue'

export type IRadioProps = {
  /**
   * The color of the radio
   */
  color?:
    | 'primary'
    | 'secondary'
    | 'positive'
    | 'warning'
    | 'negative'
    | 'info'
    | 'light'
    | 'dark'
    | 'darker'

  /**
   * A function that can be provided to compare the `val` with `model`
   */
  comparatorFn?: (model: any, val: any) => boolean

  /**
   * Whether the radio is disabled
   */
  disabled?: boolean

  /**
   * The label of the radio
   */
  label?: string

  /**
   * Model value
   */
  modelValue: any

  /**
   * The name of the radio (this is not MDN-spec compliant)
   */
  name?: string

  /**
   * When true, the radio will not have an hover effect
   */
  noHoverEffect?: boolean

  /**
   * The size of the radio
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'

  /**
   * The value of the radio
   */
  val: any

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * The class of the radio label
     */
    labelClass?: ClassType

    /**
     * The style of the radio label
     */
    labelStyle?: CSSProperties
  }
}

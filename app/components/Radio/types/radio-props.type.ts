import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
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
     * Class to apply to the container (label element)
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['radio']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the radio button element
     */
    radioClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['radio']['radioClass']>
    }) => ClassType

    /**
     * Style to apply to the radio button element
     */
    radioStyle?: () => CSSProperties

    /**
     * Class to apply to the radio label
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['radio']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the radio label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class for the focus/hover helper overlay
     */
    focusHelperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['radio']['focusHelperClass']>
    }) => ClassType

    /**
     * Style for the focus/hover helper overlay
     */
    focusHelperStyle?: () => CSSProperties
  }
}

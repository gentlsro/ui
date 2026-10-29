import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type ToggleState = 'checked' | 'unchecked' | 'indeterminate'

export type IToggleProps = {
  /**
   * Whether the toggle allows string values for the check/uncheck values
   * So the string "true" would still be considered as a checked value.
   * @default true
   */
  allowString?: boolean

  /**
   * The value of the toggle when it's checked.
   * @default true
   */
  checkValue?: any

  /**
   * Visuals: Whether the toggle "bullet" is contained within the toggle.
   * @default true
   */
  contained?: boolean

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * When true, the toggle will allow the `indeterminate` state
   */
  allowIndeterminate?: boolean

  /**
   * When true, the toggle will not have the hover effect
   */
  noHoverEffect?: boolean

  /**
   * The indeterminate value of the toggle.
   * @default null
   */
  indeterminateValue?: any

  /**
   * The toggle label
   */
  label?: string | ((payload: { state: ToggleState }) => string)

  /**
   * The actual value of the toggle.
   */
  modelValue?: any

  /**
   * Whether the toggle is readonly.
   */
  readonly?: boolean

  /**
   * The size of the toggle.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'

  /**
   * The value of the toggle when it's unchecked.
   */
  uncheckValue?: any

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container (label element)
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the toggle itself
     */
    toggleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['toggleClass']>
    }) => ClassType

    /**
     * Style to apply to the toggle itself
     */
    toggleStyle?: () => CSSProperties

    /**
     * Class to apply to the toggle bullet (the circle)
     */
    bulletClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['bulletClass']>
    }) => ClassType

    /**
     * Style to apply to the toggle bullet (the circle)
     */
    bulletStyle?: () => CSSProperties

    /**
     * Class to apply to the toggle label
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the toggle label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class for the icon inside the bullet
     */
    iconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['iconClass']>
    }) => ClassType

    /**
     * Style for the icon inside the bullet
     */
    iconStyle?: () => CSSProperties

    /**
     * Class for the focus/hover helper overlay
     */
    focusHelperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['toggle']['focusHelperClass']>
    }) => ClassType

    /**
     * Style for the focus/hover helper overlay
     */
    focusHelperStyle?: () => CSSProperties
  }
}

import type { CSSProperties } from 'vue'

// Constants
import type { CHECKBOX_DEFAULT_PROPS } from '../constants/checkbox-default-props.constant'

export type ICheckboxProps = {
  /**
   * Value for the `check` state
   */
  checkValue?: any

  /**
   * Color of the checkbox
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
   *
   * Usage: Complex structures that required `isEqual` or similar
   */
  comparatorFn?: (model: any, val: any) => boolean

  /**
   * Whether the checkbox is disabled (grayed out, not interactive)
   */
  disabled?: boolean

  /**
   * Allow the `indeterminate` state
   */
  indeterminate?: boolean

  /**
   * Value for the `indeterminate` state
   */
  indeterminateValue?: any

  /**
   * Label of the checkbox
   */
  label?: string | (() => string) | null

  /**
   * Class of the label
   */
  labelClass?: ClassType

  /**
   * Checkbox value
   */
  modelValue?: any

  /**
   * Name for the checkbox
   */
  name?: string

  /**
   * When true, the checkbox will not have the hover effect
   */
  noHoverEffect?: boolean

  /**
   * Whether the checkbox is readonly (shows value but not editable)
   */
  readonly?: boolean

  /**
   * Size of the checkbox
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'

  /**
   * Value for the `uncheck` state
   */
  uncheckValue?: any

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class for the container (label element)
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof CHECKBOX_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class of the checkbox
     */
    checkboxClass?: (payload: {
      defaults: ReturnType<typeof CHECKBOX_DEFAULT_PROPS['ui']['checkboxClass']>
    }) => ClassType

    /**
     * Style of the checkbox
     */
    checkboxStyle?: () => CSSProperties

    /**
     * Class applied to the label text
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof CHECKBOX_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style applied to the label text
     */
    labelStyle?: () => CSSProperties

    /**
     * Class for the focus/hover helper overlay
     */
    focusHelperClass?: (payload: {
      defaults: ReturnType<typeof CHECKBOX_DEFAULT_PROPS['ui']['focusHelperClass']>
    }) => ClassType

    /**
     * Style for the focus/hover helper overlay
     */
    focusHelperStyle?: () => CSSProperties
  }

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: IItem
}

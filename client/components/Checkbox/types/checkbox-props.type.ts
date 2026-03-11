import type { CSSProperties } from 'vue'

// Types
import type { ToggleState } from '../../Toggle/types/toggle-props.type'

export type CheckboxClass = Record<
  ToggleState,
  {
    checkbox?: ClassType
    label?: ClassType
    labelStyle?: CSSProperties
    checkboxStyle?: CSSProperties
  }
>

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
   * Whether the checkbox is editable
   */
  editable?: boolean

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
   * When true, the checkbox will not have the hover effect
   */
  noHoverEffect?: boolean

  /**
   * Name for the checkbox
   */
  name?: string

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
     * Class of the checkbox
     */
    checkboxClass?: (state: 'checked' | 'unchecked' | 'indeterminate') => ClassType

    /**
     * Style of the checkbox
     */
    checkboxStyle?: (state: 'checked' | 'unchecked' | 'indeterminate') => CSSProperties

    /**
     * Class applied to the label
     */
    labelClass?: (state: 'checked' | 'unchecked' | 'indeterminate') => ClassType

    /**
     * Style applied to the label
     */
    labelStyle?: (state: 'checked' | 'unchecked' | 'indeterminate') => CSSProperties
  }

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: IItem
}

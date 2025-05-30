import type { CSSProperties } from 'vue'
import type { IZodValidationItem } from '$utils'
import type { IZodValidationOptions } from '$utilsLayer/client/types/zod'

// Types
import type { IInputLabelProps } from '../../InputLabel/types/input-label-props.type'

export type IInputWrapperProps = {
  /**
   * The cursor that will be shown when hovering over the input
   */
  cursor?: 'cursor-text' | 'cursor-pointer' | 'cursor-default'

  /**
   * Whether the input is disabled
   */
  disabled?: boolean

  /**
   * Custom errors provided by the parent component
   */
  errors?: string[]

  /**
   * When true, the error container takes space (~ is relative positioned)
   * WHen false, the error container is absolute positioned
   */
  errorTakesSpace?: boolean

  /**
   * Whether the error is visible
   */
  errorVisible?: boolean

  /**
   * By default, when focusing the input, menus/dialogs that are not in the same context
   * will be hidden. We can provide the element that actually sets the context
   */
  hideUntilEl?: Element

  /**
   * The hint that will be shown below the input
   */
  hint?: string

  /**
   * Whether the input is loading
   */
  loading?: boolean

  /**
   * A marker in top right corner of the input to visualize *something*
   */
  marker?: { text: string, color?: string }

  /**
   * The input value
   */
  modelValue?: any

  /**
   * Whether the input has no border
   */
  noBorder?: boolean

  /**
   * By default, when focusing the input, menus/dialogs that are not in the same context will get hidden
   * When this prop is true, the floating will not be hidden
   */
  noHideFloating?: boolean

  /**
   * The original value of the input
   * Is used to compare the current value with the original value
   */
  originalValue?: any

  /**
   * When true, the input element will use `margin` instead of `padding` for
   * centering purposes
   *
   * Usage: `Selector` - when multiple rows of chips are present, the scroll
   * would work poorly with padding
   */
  preferMargin?: boolean

  /**
   * Whether the input is readonly
   */
  readonly?: boolean

  /**
   * When clicking into the input, the tooltip will be shown
   * NOTE: Currently works only for TextInput
   */
  tooltip?: string

  /**
   * Prop to handle the visuals of the component
   */
  ui?: {
    /**
     * Class applied to the `append` slot
     */
    appendClass?: ClassType

    /**
     * The border color of the input
     */
    borderColor?: {
      /**
       * The color of the border when the input is focused
       *
       * Note: This must be a valid CSS color string or a function that returns a valid CSS color string
       * Not a unocss class
       */
      base?: string | ((isDark: boolean) => string)

      /**
       * The color of the border when the input is focused
       *
       * Note: This must be a valid CSS color string or a function that returns a valid CSS color string
       * Not a unocss class
       */
      focus?: string | ((isDark: boolean) => string)

      /**
       * The color of the border when the input is hovered
       *
       * Note: This must be a valid CSS color string or a function that returns a valid CSS color string
       * Not a unocss class
       */
      hover?: string | ((isDark: boolean) => string)
    }

    /**
     * The border radius of the input
     */
    borderRadius?: string

    /**
     * The class of the input wrapper (including label, ...)
     */
    contentClass?: ClassType

    /**
     * The style of the input container
     */
    contentStyle?: CSSProperties

    /**
     * Class of the input container (excluding label, hint, error container, ...)
     *
     * Note: Primarily used for background color
     */
    inputContainerClass?: ClassType

    /**
     * Style of the input container
     *
     * Note: Primarily used for background color
     */
    inputContainerStyle?: CSSProperties

    /**
     * Class of the inner container around the actual input tag
     */
    inputInnerContainerClass?: ClassType

    /**
     * Style of the inner container around the actual input tag
     */
    inputInnerContainerStyle?: CSSProperties
  }

  /**
   * Validation object
   */
  validation?: IZodValidationItem | Array<IZodValidationItem | undefined>

  /**
   * Validation key
   *
   * When provided, the validation
   */
  zod?:
    | string
    | {
      key: string
      options?: IZodValidationOptions
    }
} & IInputLabelProps

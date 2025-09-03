import type { FactoryOpts, MaskedNumber } from 'imask'
import type { CSSProperties } from 'vue'

// Types
import type { IInputWrapperProps } from '../../InputWrapper/types/input-wrapper-props.type'
import type { INumberInputProps } from '$ui'

export type IInputProps = {
  /**
   * Whether the input should be autofocused
   */
  autofocus?: boolean

  /**
   * The timeout in ms for the autofocus to trigger
   */
  autofocusTimeout?: number

  /**
   * Whether the Selector can be cleared -> will emit `emptyValue`
   */
  clearable?: boolean
  /**
   * For cases when we want to warn user that he is about to clear the value
   * Usecase: when there is a dependent variable based on currently selected
   * option and by clearing the Selector, we need to also reset the dependent variable
   */
  clearConfirmation?: string

  /**
   * The debounce time in ms
   */
  debounce?: number

  /**
   * Usually, we emit the value on `input` event
   * When this is true, we emit the value on `blur` event
   */
  emitOnBlur?: boolean

  /**
   * This is the value that gets emitted, when the input is empty
   * @default undefined
   */
  emptyValue?: any

  /**
   * Whether to `touch` the input on mount
   */
  immediate?: boolean

  // Mask (https://imask.js.org/guide.html)
  mask?: FactoryOpts

  // Mask event handlers
  maskEventHandlers?: {
    onAccept?: (val: any) => void
    onCompleted?: (val: any) => void
  }

  /**
   * A function to adjust the `mask`
   */
  formatMask?: (payload: { mask: MaskedNumber, props: INumberInputProps }) => MaskedNumber

  /**
   * The input name
   */
  name?: string

  /**
   * When set to true, blur state will not erase the value and will keep the last typed value with the mask
   */
  allowIncompleteMaskValue?: boolean

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: IItem

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * The class of the input tag
     */
    inputClass?: ClassType

    /**
     * The style of the input tag
     */
    inputStyle?: CSSProperties
  }
} & IInputWrapperProps

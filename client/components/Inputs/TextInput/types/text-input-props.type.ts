// Types
import type { IMenuProps } from '$ui'
import type { IInputProps } from '../../types/input-props.type'

export type ITextInputProps = {
  /**
   * If true, the input has its own enter key handler
   */
  customEnter?: boolean

  /**
   * The inputmode (native HTML attribute)
   */
  inputmode?: 'text' | 'decimal'

  /**
   * Whether the input is copyable
   */
  noCopy?: boolean

  /**
   * The type of the input (native HTML attribute)
   */
  type?: 'text' | 'password' | 'email'

  /**
   * The props that should be passed to the tooltip
   */
  tooltipProps?: IMenuProps
} & IInputProps

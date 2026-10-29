import type { UIClasses, UIResolvedClasses } from '../../../../types/ui-config.type'
import type { AllowedComponentProps } from 'vue'

// Types
import type { IInputProps } from '../../types/input-props.type'
import type { IMenuProps } from '../../../Menu/types/menu-props.type'

export type ITextInputProps = Omit<IInputProps, 'ui'> & {
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
   * Alias for the `type` prop
   */
  inputType?: 'text' | 'password' | 'email'

  /**
   * The props that should be passed to the tooltip
   */
  tooltipProps?: IMenuProps & AllowedComponentProps
} & { ui?: UIClasses<NonNullable<(IInputProps)['ui']>, UIResolvedClasses['textInput']> }

import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'
import type { IMenuProps } from '../../Menu/types/menu-props.type'

// Constants
import type { MENU_CONFIRMATION_DEFAULT_PROPS } from '../constants/menu-confirmation-default-props.constant'

export type IMenuConfirmationProps = IMenuProps & {
  /**
   * The text to display in the confirmation menu
   */
  confirmationText?: string

  /**
   * When true, the 'confirm' button will be focused when the menu is opened
   */
  focusConfirmButton?: boolean

  /**
   * Whether the confirmation has visual confirmation (the big checkmark)
   */
  hasConfirmation?: boolean

  /**
   * When true, the confirmation menu will be shown
   */
  modelValue?: boolean

  /**
   * Whether to show the confirmation button
   * Use case: when we provide own slot with `Form` for example
   */
  noConfirmBtn?: boolean

  /**
   * Props for the confirm button
   */
  confirmBtnProps?: IBtnProps & AllowedComponentProps

  /**
   * UI configuration
   */
  ui?: IMenuProps['ui'] & {
    /**
     * Class to apply to the 'confirm' button
     */
    confirmBtnClass?: (payload: {
      defaults: ReturnType<typeof MENU_CONFIRMATION_DEFAULT_PROPS['ui']['confirmBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the 'confirm' button
     */
    confirmBtnStyle?: () => CSSProperties
  }
}

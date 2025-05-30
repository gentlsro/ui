// Types
import type { IMenuProps } from '../../Menu/types/menu-props.type'

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

  ui?: IMenuProps['ui'] & {
    /**
     * Class to apply to the 'confirm' button
     */
    confirmBtnClass?: ClassType
  }
}

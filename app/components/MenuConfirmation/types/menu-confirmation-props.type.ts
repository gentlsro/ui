import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'
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
      defaults: UIClassPicker<UIResolvedClasses['menuConfirmation']['confirmBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the 'confirm' button
     */
    confirmBtnStyle?: () => CSSProperties

    /**
     * Style to apply to the confirmation text
     */
    confirmationTextStyle?: () => CSSProperties

    /**
     * Class to apply to the confirmation text
     */
    confirmationTextClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['menuConfirmation']['confirmationTextClass']>
    }) => ClassType
  }
}

import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IConfirmationProps = {
  /**
   * The text of the confirmation
   */
  confirmationText?: string

  /**
   * The delay with which the confirmation will be shown
   */
  delay?: number

  /**
   * When true, the confirmation will not have actions
   */
  noActions?: boolean

  /**
   * Visibility of the confirmation
   */
  visible?: boolean

  /**
   * UI customization
   */
  ui?: {
    /**
     * Class for the container element
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['confirmation']['containerClass']>
    }) => ClassType

    /**
     * Style for the container element
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the checkmark wrapper element
     */
    checkmarkClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['confirmation']['checkmarkClass']>
    }) => ClassType

    /**
     * Style for the checkmark wrapper element
     */
    checkmarkStyle?: () => CSSProperties

    /**
     * Class for the text element
     */
    textClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['confirmation']['textClass']>
    }) => ClassType

    /**
     * Style for the text element
     */
    textStyle?: () => CSSProperties

    /**
     * Class for the actions element
     */
    actionsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['confirmation']['actionsClass']>
    }) => ClassType

    /**
     * Style for the actions element
     */
    actionsStyle?: () => CSSProperties
  }
}

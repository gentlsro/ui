import type { CSSProperties } from 'vue'
import type { CONFIRMATION_DEFAULT_PROPS } from '../constants/confirmation-default-props.constant'

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
      defaults: ReturnType<typeof CONFIRMATION_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container element
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the checkmark wrapper element
     */
    checkmarkClass?: (payload: {
      defaults: ReturnType<typeof CONFIRMATION_DEFAULT_PROPS['ui']['checkmarkClass']>
    }) => ClassType

    /**
     * Style for the checkmark wrapper element
     */
    checkmarkStyle?: () => CSSProperties

    /**
     * Class for the text element
     */
    textClass?: (payload: {
      defaults: ReturnType<typeof CONFIRMATION_DEFAULT_PROPS['ui']['textClass']>
    }) => ClassType

    /**
     * Style for the text element
     */
    textStyle?: () => CSSProperties

    /**
     * Class for the actions element
     */
    actionsClass?: (payload: {
      defaults: ReturnType<typeof CONFIRMATION_DEFAULT_PROPS['ui']['actionsClass']>
    }) => ClassType

    /**
     * Style for the actions element
     */
    actionsStyle?: () => CSSProperties
  }
}

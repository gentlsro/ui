export type IConfirmationProps = {
  /**
   * The class of the confirmation checkmark
   */
  checkmarkClass?: ClassType

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
}

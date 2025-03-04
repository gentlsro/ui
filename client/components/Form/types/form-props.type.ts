import type { CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'
import type { ISectionProps } from '../../Section/types/section-props.type'

export type IFormProps = {
  /**
   * If true, the form will have a border.
   */
  bordered?: boolean

  /**
   * When true, the class `form--dense` will be added to the form.
   *
   * Usage: for using `<Section />` inside the form.
   */
  dense?: boolean

  /**
   * Control elements to display in the form
   */
  editControls?:
    | {
      edit?: boolean
      cancel?: boolean
    }
    | boolean

  /**
   * Errors to display in the form.
   */
  errors?: string[]

  /**
   * Label of the submit button
   */
  label?: string

  /**
   * Icon of the submit button (technically the same as `submitBtnProps.icon`)
   */
  icon?: string | false

  /**
   * If true, the form's submit button will have loading state.
   */
  loading?: boolean

  /**
   * If true, the first editable input in the form will be focused.
   */
  focusFirstInput?: boolean

  /**
   * If true, the form will be in editing mode.
   */
  isEditing?: boolean

  /**
   * By default, the form will display the controls on the bottom of the form. (Submit button, etc.)
   * If this is true, the controls will be displayed on the top of the form.
   */
  controlsOnTop?: boolean

  /**
   * By default, the form will display the errors on the bottom of the form.
   * If this is true, the errors will be displayed on the top of the form.
   */
  errorsOnTop?: boolean

  /**
   * When explicitly set to `false`, we do not show the controls.
   * This is the opposite of `noControls` below usable in specific cases
   *
   * For example, when checking some claim, the claim-checking function would always
   * return true if the user is a super-admin. If we used something like `!$hasClaim(ClaimEnum.SUPER_ADMIN)`
   * the claim-checking function would return false for super-admins, which is not what we want.
   */
  hasControls?: boolean

  /**
   * By default, on smaller screens, the buttons in the form will use their icons
   * to save the screen space. If this is true, the buttons will always display
   * the labels as well.
   */
  labelForcedVisibility?: boolean

  /**
   * Whether the form should include the bottom controls
   */
  noControls?: boolean

  /**
   * Whether the form should include the edit controls. This is the opposite of the
   * `editControls` prop above, usable in specific cases.
   *
   * Note: has priority over `editControls`
   */
  noEditControls?: boolean

  /**
   * If true, the form will not show the shortcuts.
   */
  noShortcuts?: boolean

  /**
   * If true, the form will include the submit button.
   */
  noSubmit?: boolean

  /**
   * If true, the form will not submit on enter.
   *
   * Note: Will be sumitted on ctrl+enter.
   */
  preventSubmitOnEnter?: boolean

  /**
   * A function that resets the model on form editing cancel
   */
  reset?: () => void

  /**
   * If true, the form submit will need to be confirmed in a confirmation menu.
   */
  submitConfirmation?: boolean

  /**
   * The text to display in the submit confirmation menu.
   */
  submitConfirmationText?: string

  /**
   * Props for the submit button
   */
  submitBtnProps?: IBtnProps & IItem

  /**
   * Props for the cancel button
   */
  cancelBtnProps?: IBtnProps & IItem

  /**
   * Props for the errors section
   */
  errorsSectionProps?: ISectionProps

  /**
   * If true, the submit button will be disabled.
   */
  submitDisabled?: boolean

  ui?: {
    /**
     * Class to apply to the cancel button
     */
    cancelClass?: ClassType

    /**
     * Style to apply to the cancel button
     */
    cancelStyle?: CSSProperties

    /**
     * Class to apply to the form itself
     */
    containerClass?: ClassType

    /**
     * Class to apply to the content
     */
    contentClass?: ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: CSSProperties

    /**
     * Style to apply to the form itself
     */
    containerStyle?: CSSProperties

    /**
     * Class to apply to the submit button
     */
    submitClass?: ClassType

    /**
     * Style to apply to the submit button
     */
    submitStyle?: CSSProperties

    /**
     * Class to apply to the controls container
     */
    controlsClass?: ClassType

    /**
     * Style to apply to the controls container
     */
    controlsStyle?: CSSProperties

    /**
     *  Class to apply to the submit button wrapper (which might have the Cancel button and slots)
     */
    submitWrapperClass?: ClassType

    /**
     * Style to apply to the submit button wrapper (which might have the Cancel button and slots)
     */
    submitWrapperStyle?: CSSProperties
  }
}

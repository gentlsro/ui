// Types
import type { IFormProps } from '../types/form-props.type'

export function useFormUtils() {
  function getFormProps(props: IFormProps) {
    return reactivePick(props, [
      'editDisabled',
      'editControls',
      'errors',
      'focusFirstInput',
      'hasControls',
      'label',
      'loading',
      'noSubmit',
      'noControls',
      'noEnter',
      'preventSubmitOnEnter',
      'reset',
      'submitBtnProps',
      'submitConfirmation',
      'submitConfirmationText',
      'submitDisabled',
      'ui',
    ])
  }

  function getFormControlsProps(props: IFormProps) {
    return reactivePick(props, [
      'label',
      'noSubmit',
      'labelForcedVisibility',
      'editDisabled',
      'editControls',
      'noEditControls',
      'noSubmit',
      'submitConfirmationText',
      'icon',
    ])
  }

  return {
    getFormProps,
    getFormControlsProps,
  }
}

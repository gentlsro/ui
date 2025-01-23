// Types
import type { IFormProps } from '../types/form-props.type'

export function useFormUtils() {
  function getFormProps(props: IFormProps) {
    return reactivePick(props, [
      'editControls',
      'errors',
      'focusFirstInput',
      'hasControls',
      'label',
      'loading',
      'noSubmit',
      'noGrow',
      'noControls',
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

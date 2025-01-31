import { uiConfig } from '$ui'

// Types
import type { IFormProps } from '../types/form-props.type'

export function formHasConfirmation(
  propsSubmitConfirmation?: IFormProps['submitConfirmation'],
  storeSubmitConfirmation?: IFormProps['submitConfirmation'],
) {
  // When set via props, we want to use that
  if (propsSubmitConfirmation !== undefined) {
    return propsSubmitConfirmation
  }

  // If the confirmation is not generally editable, we use whatever is in the config
  const { editable, required } = uiConfig.form.confirmationInit

  if (!editable) {
    return required
  }

  // Otherwise, we use  whatever is in the store
  return !!storeSubmitConfirmation
}

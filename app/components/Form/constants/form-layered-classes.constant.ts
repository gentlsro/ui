import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { FORM_DEFAULT_PROPS } from './form-default-props.constant'
import { FORM_CLASS_COMPOSERS, FORM_CLASS_DERIVED, FORM_CLASS_SLOTS } from './form-class-slots.constant'

export const FORM_LAYERED_CLASSES = createUIClassResolver('form', {
  slots: FORM_CLASS_SLOTS,
  compose: FORM_CLASS_COMPOSERS,
  defaults: FORM_DEFAULT_PROPS.ui,
  derive: FORM_CLASS_DERIVED,
}, () => uiClassLayers)

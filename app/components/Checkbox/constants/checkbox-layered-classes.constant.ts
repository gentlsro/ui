import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { CHECKBOX_DEFAULT_PROPS } from './checkbox-default-props.constant'
import { CHECKBOX_CLASS_COMPOSERS, CHECKBOX_CLASS_SLOTS } from './checkbox-class-slots.constant'

export const CHECKBOX_LAYERED_CLASSES = createUIClassResolver('checkbox', {
  slots: CHECKBOX_CLASS_SLOTS,
  compose: CHECKBOX_CLASS_COMPOSERS,
  defaults: CHECKBOX_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

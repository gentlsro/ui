import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BTN_DEFAULT_PROPS } from './btn-default-props.constant'
import { BTN_CLASS_COMPOSERS, BTN_CLASS_SLOTS } from './button-class-slots.constant'

export const BTN_LAYERED_CLASSES = createUIClassResolver('button', {
  slots: BTN_CLASS_SLOTS,
  compose: BTN_CLASS_COMPOSERS,
  defaults: BTN_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

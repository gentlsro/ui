import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BUTTON_GROUP_DEFAULT_PROPS } from './button-group-default-props.constant'
import { BUTTON_GROUP_CLASS_COMPOSERS, BUTTON_GROUP_CLASS_SLOTS } from './button-group-class-slots.constant'

export const BUTTON_GROUP_LAYERED_CLASSES = createUIClassResolver('buttonGroup', {
  slots: BUTTON_GROUP_CLASS_SLOTS,
  compose: BUTTON_GROUP_CLASS_COMPOSERS,
  defaults: BUTTON_GROUP_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { CONFIRMATION_DEFAULT_PROPS } from './confirmation-default-props.constant'
import { CONFIRMATION_CLASS_COMPOSERS, CONFIRMATION_CLASS_SLOTS } from './confirmation-class-slots.constant'

export const CONFIRMATION_LAYERED_CLASSES = createUIClassResolver('confirmation', {
  slots: CONFIRMATION_CLASS_SLOTS,
  compose: CONFIRMATION_CLASS_COMPOSERS,
  defaults: CONFIRMATION_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

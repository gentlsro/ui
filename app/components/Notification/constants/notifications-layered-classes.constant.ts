import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { NOTIFICATIONS_DEFAULT_PROPS } from './notifications-default-props.constant'
import { NOTIFICATIONS_CLASS_COMPOSERS, NOTIFICATIONS_CLASS_SLOTS } from './notifications-class-slots.constant'

export const NOTIFICATIONS_LAYERED_CLASSES = createUIClassResolver('notifications', {
  slots: NOTIFICATIONS_CLASS_SLOTS,
  compose: NOTIFICATIONS_CLASS_COMPOSERS,
  defaults: NOTIFICATIONS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

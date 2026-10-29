import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { NOTIFICATION_ROW_DEFAULT_PROPS } from './notification-row-default-props.constant'
import { NOTIFICATION_ROW_CLASS_COMPOSERS, NOTIFICATION_ROW_CLASS_SLOTS } from './notification-row-class-slots.constant'

export const NOTIFICATION_ROW_LAYERED_CLASSES = createUIClassResolver('notificationRow', {
  slots: NOTIFICATION_ROW_CLASS_SLOTS,
  compose: NOTIFICATION_ROW_CLASS_COMPOSERS,
  defaults: NOTIFICATION_ROW_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MENU_CONFIRMATION_DEFAULT_PROPS } from './menu-confirmation-default-props.constant'
import { MENU_CONFIRMATION_CLASS_COMPOSERS, MENU_CONFIRMATION_CLASS_SLOTS } from './menu-confirmation-class-slots.constant'

export const MENU_CONFIRMATION_LAYERED_CLASSES = createUIClassResolver('menuConfirmation', {
  slots: MENU_CONFIRMATION_CLASS_SLOTS,
  compose: MENU_CONFIRMATION_CLASS_COMPOSERS,
  defaults: MENU_CONFIRMATION_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

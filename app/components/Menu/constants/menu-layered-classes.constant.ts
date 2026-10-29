import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MENU_DEFAULT_PROPS } from './menu-default-props.constant'
import { MENU_CLASS_COMPOSERS, MENU_CLASS_SLOTS } from './menu-class-slots.constant'

export const MENU_LAYERED_CLASSES = createUIClassResolver('menu', {
  slots: MENU_CLASS_SLOTS,
  compose: MENU_CLASS_COMPOSERS,
  defaults: MENU_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

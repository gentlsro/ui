import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { PAGE_DRAWER_DEFAULT_PROPS } from './page-drawer-default-props.constant'
import { PAGE_DRAWER_CLASS_COMPOSERS, PAGE_DRAWER_CLASS_SLOTS } from './page-drawer-class-slots.constant'

export const PAGE_DRAWER_LAYERED_CLASSES = createUIClassResolver('pageDrawer', {
  slots: PAGE_DRAWER_CLASS_SLOTS,
  compose: PAGE_DRAWER_CLASS_COMPOSERS,
  defaults: PAGE_DRAWER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

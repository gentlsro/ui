import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { DRAWER_DEFAULT_PROPS } from './drawer-default-props.constant'
import { DRAWER_CLASS_COMPOSERS, DRAWER_CLASS_SLOTS } from './drawer-class-slots.constant'

export const DRAWER_LAYERED_CLASSES = createUIClassResolver('drawer', {
  slots: DRAWER_CLASS_SLOTS,
  compose: DRAWER_CLASS_COMPOSERS,
  defaults: DRAWER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

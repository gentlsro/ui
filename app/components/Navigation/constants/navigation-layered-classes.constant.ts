import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { NAVIGATION_DEFAULT_PROPS } from './navigation-default-props.constant'
import { NAVIGATION_CLASS_COMPOSERS, NAVIGATION_CLASS_SLOTS } from './navigation-class-slots.constant'

export const NAVIGATION_LAYERED_CLASSES = createUIClassResolver('navigation', {
  slots: NAVIGATION_CLASS_SLOTS,
  compose: NAVIGATION_CLASS_COMPOSERS,
  defaults: NAVIGATION_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

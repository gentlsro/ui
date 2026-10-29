import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SCROLL_AREA_DEFAULT_PROPS } from './scroll-area-default-props.constant'
import { SCROLL_AREA_CLASS_COMPOSERS, SCROLL_AREA_CLASS_SLOTS } from './scroll-area-class-slots.constant'

export const SCROLL_AREA_LAYERED_CLASSES = createUIClassResolver('scrollArea', {
  slots: SCROLL_AREA_CLASS_SLOTS,
  compose: SCROLL_AREA_CLASS_COMPOSERS,
  defaults: SCROLL_AREA_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { VIRTUAL_SCROLLER_DEFAULT_PROPS } from './virtual-scroller-default-props'
import { VIRTUAL_SCROLLER_CLASS_COMPOSERS, VIRTUAL_SCROLLER_CLASS_SLOTS } from './virtual-scroller-class-slots.constant'

export const VIRTUAL_SCROLLER_LAYERED_CLASSES = createUIClassResolver('virtualScroller', {
  slots: VIRTUAL_SCROLLER_CLASS_SLOTS,
  compose: VIRTUAL_SCROLLER_CLASS_COMPOSERS,
  defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

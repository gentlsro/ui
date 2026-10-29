import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS } from './virtual-scroller-vertical-default-props'
import { VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS, VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS } from './virtual-scroller-vertical-class-slots.constant'

export const VIRTUAL_SCROLLER_VERTICAL_LAYERED_CLASSES = createUIClassResolver('virtualScrollerVertical', {
  slots: VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS,
  compose: VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS,
  defaults: VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TOOLTIP_DEFAULT_PROPS } from './tooltip-default-props.constant'
import { TOOLTIP_CLASS_COMPOSERS, TOOLTIP_CLASS_SLOTS } from './tooltip-class-slots.constant'

export const TOOLTIP_LAYERED_CLASSES = createUIClassResolver('tooltip', {
  slots: TOOLTIP_CLASS_SLOTS,
  compose: TOOLTIP_CLASS_COMPOSERS,
  defaults: TOOLTIP_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

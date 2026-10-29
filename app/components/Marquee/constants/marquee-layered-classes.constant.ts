import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MARQUEE_DEFAULT_PROPS } from './marquee-default-props.constant'
import { MARQUEE_CLASS_COMPOSERS, MARQUEE_CLASS_SLOTS } from './marquee-class-slots.constant'

export const MARQUEE_LAYERED_CLASSES = createUIClassResolver('marquee', {
  slots: MARQUEE_CLASS_SLOTS,
  compose: MARQUEE_CLASS_COMPOSERS,
  defaults: MARQUEE_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

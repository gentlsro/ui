import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BADGE_DEFAULT_PROPS } from './badge-default-props.constant'
import { BADGE_CLASS_COMPOSERS, BADGE_CLASS_DERIVED, BADGE_CLASS_SLOTS } from './badge-class-slots.constant'

export const BADGE_LAYERED_CLASSES = createUIClassResolver('badge', {
  slots: BADGE_CLASS_SLOTS,
  compose: BADGE_CLASS_COMPOSERS,
  defaults: BADGE_DEFAULT_PROPS.ui,
  derive: BADGE_CLASS_DERIVED,
}, () => uiClassLayers)

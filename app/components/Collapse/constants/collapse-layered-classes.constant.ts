import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { COLLAPSE_DEFAULT_PROPS } from './collapse-default-props.constant'
import { COLLAPSE_CLASS_COMPOSERS, COLLAPSE_CLASS_SLOTS } from './collapse-class-slots.constant'

export const COLLAPSE_LAYERED_CLASSES = createUIClassResolver('collapse', {
  slots: COLLAPSE_CLASS_SLOTS,
  compose: COLLAPSE_CLASS_COMPOSERS,
  defaults: COLLAPSE_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

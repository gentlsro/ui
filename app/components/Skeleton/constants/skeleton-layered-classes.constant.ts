import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SKELETON_DEFAULT_PROPS } from './skeleton-default-props.constant'
import { SKELETON_CLASS_COMPOSERS, SKELETON_CLASS_SLOTS } from './skeleton-class-slots.constant'

export const SKELETON_LAYERED_CLASSES = createUIClassResolver('skeleton', {
  slots: SKELETON_CLASS_SLOTS,
  compose: SKELETON_CLASS_COMPOSERS,
  defaults: SKELETON_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

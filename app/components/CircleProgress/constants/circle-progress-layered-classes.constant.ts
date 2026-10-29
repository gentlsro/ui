import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { CIRCLE_PROGRESS_DEFAULT_PROPS } from './circle-progress-default-props.constant'
import { CIRCLE_PROGRESS_CLASS_COMPOSERS, CIRCLE_PROGRESS_CLASS_SLOTS } from './circle-progress-class-slots.constant'

export const CIRCLE_PROGRESS_LAYERED_CLASSES = createUIClassResolver('circleProgress', {
  slots: CIRCLE_PROGRESS_CLASS_SLOTS,
  compose: CIRCLE_PROGRESS_CLASS_COMPOSERS,
  defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

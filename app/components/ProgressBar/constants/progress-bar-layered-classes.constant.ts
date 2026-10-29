import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { PROGRESS_BAR_DEFAULT_PROPS } from './progress-bar-default-props.constant'
import { PROGRESS_BAR_CLASS_COMPOSERS, PROGRESS_BAR_CLASS_SLOTS } from './progress-bar-class-slots.constant'

export const PROGRESS_BAR_LAYERED_CLASSES = createUIClassResolver('progressBar', {
  slots: PROGRESS_BAR_CLASS_SLOTS,
  compose: PROGRESS_BAR_CLASS_COMPOSERS,
  defaults: PROGRESS_BAR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SEPARATOR_DEFAULT_PROPS } from './separator-default-props.constant'
import { SEPARATOR_CLASS_COMPOSERS, SEPARATOR_CLASS_SLOTS } from './separator-class-slots.constant'

export const SEPARATOR_LAYERED_CLASSES = createUIClassResolver('separator', {
  slots: SEPARATOR_CLASS_SLOTS,
  compose: SEPARATOR_CLASS_COMPOSERS,
  defaults: SEPARATOR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

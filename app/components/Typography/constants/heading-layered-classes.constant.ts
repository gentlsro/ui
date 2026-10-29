import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { HEADING_DEFAULT_PROPS } from './heading-default-props.constant'
import { HEADING_CLASS_COMPOSERS, HEADING_CLASS_SLOTS } from './heading-class-slots.constant'

export const HEADING_LAYERED_CLASSES = createUIClassResolver('heading', {
  slots: HEADING_CLASS_SLOTS,
  compose: HEADING_CLASS_COMPOSERS,
  defaults: HEADING_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

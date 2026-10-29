import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SECTION_DEFAULT_PROPS } from './section-default-props.constant'
import { SECTION_CLASS_COMPOSERS, SECTION_CLASS_SLOTS } from './section-class-slots.constant'

export const SECTION_LAYERED_CLASSES = createUIClassResolver('section', {
  slots: SECTION_CLASS_SLOTS,
  compose: SECTION_CLASS_COMPOSERS,
  defaults: SECTION_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

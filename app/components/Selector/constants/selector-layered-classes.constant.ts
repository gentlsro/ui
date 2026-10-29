import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SELECTOR_DEFAULT_PROPS } from './selector-default-props'
import { SELECTOR_CLASS_COMPOSERS, SELECTOR_CLASS_SLOTS } from './selector-class-slots.constant'

export const SELECTOR_LAYERED_CLASSES = createUIClassResolver('selector', {
  slots: SELECTOR_CLASS_SLOTS,
  compose: SELECTOR_CLASS_COMPOSERS,
  defaults: SELECTOR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

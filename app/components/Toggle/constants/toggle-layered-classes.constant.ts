import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TOGGLE_DEFAULT_PROPS } from './toggle-default-props.constant'
import { TOGGLE_CLASS_COMPOSERS, TOGGLE_CLASS_DERIVED, TOGGLE_CLASS_SLOTS } from './toggle-class-slots.constant'

export const TOGGLE_LAYERED_CLASSES = createUIClassResolver('toggle', {
  slots: TOGGLE_CLASS_SLOTS,
  compose: TOGGLE_CLASS_COMPOSERS,
  defaults: TOGGLE_DEFAULT_PROPS.ui,
  derive: TOGGLE_CLASS_DERIVED,
}, () => uiClassLayers)

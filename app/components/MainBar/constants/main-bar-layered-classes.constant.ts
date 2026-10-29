import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MAIN_BAR_DEFAULT_PROPS } from './main-bar-default-props.constant'
import { MAIN_BAR_CLASS_COMPOSERS, MAIN_BAR_CLASS_SLOTS } from './main-bar-class-slots.constant'

export const MAIN_BAR_LAYERED_CLASSES = createUIClassResolver('mainBar', {
  slots: MAIN_BAR_CLASS_SLOTS,
  compose: MAIN_BAR_CLASS_COMPOSERS,
  defaults: MAIN_BAR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

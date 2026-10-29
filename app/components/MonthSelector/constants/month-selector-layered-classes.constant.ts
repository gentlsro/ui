import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MONTH_SELECTOR_DEFAULT_PROPS } from './month-selector-default-props.constant'
import { MONTH_SELECTOR_CLASS_COMPOSERS, MONTH_SELECTOR_CLASS_SLOTS } from './month-selector-class-slots.constant'

export const MONTH_SELECTOR_LAYERED_CLASSES = createUIClassResolver('monthSelector', {
  slots: MONTH_SELECTOR_CLASS_SLOTS,
  compose: MONTH_SELECTOR_CLASS_COMPOSERS,
  defaults: MONTH_SELECTOR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

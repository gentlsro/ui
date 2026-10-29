import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { YEAR_SELECTOR_DEFAULT_PROPS } from './year-selector-default-props.constant'
import { YEAR_SELECTOR_CLASS_COMPOSERS, YEAR_SELECTOR_CLASS_SLOTS } from './year-selector-class-slots.constant'

export const YEAR_SELECTOR_LAYERED_CLASSES = createUIClassResolver('yearSelector', {
  slots: YEAR_SELECTOR_CLASS_SLOTS,
  compose: YEAR_SELECTOR_CLASS_COMPOSERS,
  defaults: YEAR_SELECTOR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

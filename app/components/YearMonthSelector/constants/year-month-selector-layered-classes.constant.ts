import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { YEAR_MONTH_SELECTOR_DEFAULT_PROPS } from './year-month-selector-default-props.constant'
import { YEAR_MONTH_SELECTOR_CLASS_COMPOSERS, YEAR_MONTH_SELECTOR_CLASS_SLOTS } from './year-month-selector-class-slots.constant'

export const YEAR_MONTH_SELECTOR_LAYERED_CLASSES = createUIClassResolver('yearMonthSelector', {
  slots: YEAR_MONTH_SELECTOR_CLASS_SLOTS,
  compose: YEAR_MONTH_SELECTOR_CLASS_COMPOSERS,
  defaults: YEAR_MONTH_SELECTOR_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MONTH_SELECTOR_GRID_DEFAULT_PROPS } from './month-selector-grid-default-props.constant'
import { MONTH_SELECTOR_GRID_CLASS_COMPOSERS, MONTH_SELECTOR_GRID_CLASS_SLOTS } from './month-selector-grid-class-slots.constant'

export const MONTH_SELECTOR_GRID_LAYERED_CLASSES = createUIClassResolver('monthSelectorGrid', {
  slots: MONTH_SELECTOR_GRID_CLASS_SLOTS,
  compose: MONTH_SELECTOR_GRID_CLASS_COMPOSERS,
  defaults: MONTH_SELECTOR_GRID_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

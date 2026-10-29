import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { PIVOT_DEFAULT_PROPS } from './pivot-default-props.constant'
import { PIVOT_CLASS_COMPOSERS, PIVOT_CLASS_SLOTS } from './pivot-class-slots.constant'

export const PIVOT_LAYERED_CLASSES = createUIClassResolver('pivot', {
  slots: PIVOT_CLASS_SLOTS,
  compose: PIVOT_CLASS_COMPOSERS,
  defaults: PIVOT_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

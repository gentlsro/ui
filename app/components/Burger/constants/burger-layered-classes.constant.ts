import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BURGER_DEFAULT_PROPS } from './burger-default-props.constant'
import { BURGER_CLASS_COMPOSERS, BURGER_CLASS_SLOTS } from './burger-class-slots.constant'

export const BURGER_LAYERED_CLASSES = createUIClassResolver('burger', {
  slots: BURGER_CLASS_SLOTS,
  compose: BURGER_CLASS_COMPOSERS,
  defaults: BURGER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { ITEM_DEFAULT_PROPS } from './item-default-props.constant'
import { ITEM_CLASS_COMPOSERS, ITEM_CLASS_SLOTS } from './item-class-slots.constant'

export const ITEM_LAYERED_CLASSES = createUIClassResolver('item', {
  slots: ITEM_CLASS_SLOTS,
  compose: ITEM_CLASS_COMPOSERS,
  defaults: ITEM_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

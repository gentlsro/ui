import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { MINI_CARD_DEFAULT_PROPS } from './mini-card-default-props.constant'
import { MINI_CARD_CLASS_COMPOSERS, MINI_CARD_CLASS_SLOTS } from './mini-card-class-slots.constant'

export const MINI_CARD_LAYERED_CLASSES = createUIClassResolver('miniCard', {
  slots: MINI_CARD_CLASS_SLOTS,
  compose: MINI_CARD_CLASS_COMPOSERS,
  defaults: MINI_CARD_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

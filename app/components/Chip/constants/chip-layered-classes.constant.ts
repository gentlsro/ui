import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { CHIP_DEFAULT_PROPS } from './chip-default-props.constant'
import { CHIP_CLASS_COMPOSERS, CHIP_CLASS_SLOTS } from './chip-class-slots.constant'

export const CHIP_LAYERED_CLASSES = createUIClassResolver('chip', {
  slots: CHIP_CLASS_SLOTS,
  compose: CHIP_CLASS_COMPOSERS,
  defaults: CHIP_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

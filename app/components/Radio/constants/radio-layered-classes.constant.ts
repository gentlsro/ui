import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { RADIO_DEFAULT_PROPS } from './radio-default-props.constant'
import { RADIO_CLASS_COMPOSERS, RADIO_CLASS_SLOTS } from './radio-class-slots.constant'

export const RADIO_LAYERED_CLASSES = createUIClassResolver('radio', {
  slots: RADIO_CLASS_SLOTS,
  compose: RADIO_CLASS_COMPOSERS,
  defaults: RADIO_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

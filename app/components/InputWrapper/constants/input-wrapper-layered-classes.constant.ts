import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { INPUT_WRAPPER_DEFAULT_PROPS } from './input-wrapper-default-props'
import { INPUT_WRAPPER_CLASS_COMPOSERS, INPUT_WRAPPER_CLASS_SLOTS } from './input-wrapper-class-slots.constant'

export const INPUT_WRAPPER_LAYERED_CLASSES = createUIClassResolver('inputWrapper', {
  slots: INPUT_WRAPPER_CLASS_SLOTS,
  compose: INPUT_WRAPPER_CLASS_COMPOSERS,
  defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

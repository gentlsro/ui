import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { INPUT_LABEL_DEFAULT_PROPS } from './input-label-default-props'
import { INPUT_LABEL_CLASS_COMPOSERS, INPUT_LABEL_CLASS_SLOTS } from './input-label-class-slots.constant'

export const INPUT_LABEL_LAYERED_CLASSES = createUIClassResolver('inputLabel', {
  slots: INPUT_LABEL_CLASS_SLOTS,
  compose: INPUT_LABEL_CLASS_COMPOSERS,
  defaults: INPUT_LABEL_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

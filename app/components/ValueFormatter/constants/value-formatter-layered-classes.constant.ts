import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { VALUE_FORMATTER_DEFAULT_PROPS } from './value-formatter-default-props.constant'
import { VALUE_FORMATTER_CLASS_COMPOSERS, VALUE_FORMATTER_CLASS_SLOTS } from './value-formatter-class-slots.constant'

export const VALUE_FORMATTER_LAYERED_CLASSES = createUIClassResolver('valueFormatter', {
  slots: VALUE_FORMATTER_CLASS_SLOTS,
  compose: VALUE_FORMATTER_CLASS_COMPOSERS,
  defaults: VALUE_FORMATTER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

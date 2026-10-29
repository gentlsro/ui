import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { DATE_PICKER_DEFAULT_PROPS } from './datepicker-default-props.constant'
import { DATE_PICKER_CLASS_COMPOSERS, DATE_PICKER_CLASS_SLOTS } from './datepicker-class-slots.constant'

export const DATE_PICKER_LAYERED_CLASSES = createUIClassResolver('datePicker', {
  slots: DATE_PICKER_CLASS_SLOTS,
  compose: DATE_PICKER_CLASS_COMPOSERS,
  defaults: DATE_PICKER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

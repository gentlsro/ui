import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { STEPPER_DEFAULT_PROPS } from './stepper-default-props.constant'
import { STEPPER_CLASS_COMPOSERS, STEPPER_CLASS_SLOTS } from './stepper-class-slots.constant'

export const STEPPER_LAYERED_CLASSES = createUIClassResolver('stepper', {
  slots: STEPPER_CLASS_SLOTS,
  compose: STEPPER_CLASS_COMPOSERS,
  defaults: STEPPER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

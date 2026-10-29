import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { DIALOG_DEFAULT_PROPS } from './dialog-default-props.constant'
import { DIALOG_CLASS_COMPOSERS, DIALOG_CLASS_SLOTS } from './dialog-class-slots.constant'

export const DIALOG_LAYERED_CLASSES = createUIClassResolver('dialog', {
  slots: DIALOG_CLASS_SLOTS,
  compose: DIALOG_CLASS_COMPOSERS,
  defaults: DIALOG_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { LIST_DEFAULT_PROPS } from './list-default-props.constant'
import { LIST_CLASS_COMPOSERS, LIST_CLASS_SLOTS } from './list-class-slots.constant'

export const LIST_LAYERED_CLASSES = createUIClassResolver('list', {
  slots: LIST_CLASS_SLOTS,
  compose: LIST_CLASS_COMPOSERS,
  defaults: LIST_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

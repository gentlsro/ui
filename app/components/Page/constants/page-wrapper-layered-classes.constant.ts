import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { PAGE_WRAPPER_DEFAULT_PROPS } from './page-wrapper-default-props.constant'
import { PAGE_WRAPPER_CLASS_COMPOSERS, PAGE_WRAPPER_CLASS_SLOTS } from './page-wrapper-class-slots.constant'

export const PAGE_WRAPPER_LAYERED_CLASSES = createUIClassResolver('pageWrapper', {
  slots: PAGE_WRAPPER_CLASS_SLOTS,
  compose: PAGE_WRAPPER_CLASS_COMPOSERS,
  defaults: PAGE_WRAPPER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

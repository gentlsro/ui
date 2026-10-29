import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { PAGE_TITLE_DEFAULT_PROPS } from './page-title-default-props.constant'
import { PAGE_TITLE_CLASS_COMPOSERS, PAGE_TITLE_CLASS_SLOTS } from './page-title-class-slots.constant'

export const PAGE_TITLE_LAYERED_CLASSES = createUIClassResolver('pageTitle', {
  slots: PAGE_TITLE_CLASS_SLOTS,
  compose: PAGE_TITLE_CLASS_COMPOSERS,
  defaults: PAGE_TITLE_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

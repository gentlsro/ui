import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BREADCRUMBS_DEFAULT_PROPS } from './breadcrumbs-default-props.constant'
import { BREADCRUMBS_CLASS_COMPOSERS, BREADCRUMBS_CLASS_SLOTS } from './breadcrumbs-class-slots.constant'

export const BREADCRUMBS_LAYERED_CLASSES = createUIClassResolver('breadcrumbs', {
  slots: BREADCRUMBS_CLASS_SLOTS,
  compose: BREADCRUMBS_CLASS_COMPOSERS,
  defaults: BREADCRUMBS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

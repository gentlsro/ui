import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TREE_DMS_DEFAULT_PROPS } from './tree-dms-default-props.constant'
import { TREE_DMS_CLASS_COMPOSERS, TREE_DMS_CLASS_SLOTS } from './tree-dms-class-slots.constant'

export const TREE_DMS_LAYERED_CLASSES = createUIClassResolver('treeDms', {
  slots: TREE_DMS_CLASS_SLOTS,
  compose: TREE_DMS_CLASS_COMPOSERS,
  defaults: TREE_DMS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

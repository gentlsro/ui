import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TREE_DEFAULT_PROPS } from './tree-default-props.constant'
import { TREE_CLASS_COMPOSERS, TREE_CLASS_SLOTS } from './tree-class-slots.constant'

export const TREE_LAYERED_CLASSES = createUIClassResolver('tree', {
  slots: TREE_CLASS_SLOTS,
  compose: TREE_CLASS_COMPOSERS,
  defaults: TREE_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

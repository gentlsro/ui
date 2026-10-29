import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TABLE_DEFAULT_PROPS } from './table-default-props.constant'
import { TABLE_CLASS_COMPOSERS, TABLE_CLASS_SLOTS } from './table-class-slots.constant'

export const TABLE_LAYERED_CLASSES = createUIClassResolver('table', {
  slots: TABLE_CLASS_SLOTS,
  compose: TABLE_CLASS_COMPOSERS,
  defaults: TABLE_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { TABS_DEFAULT_PROPS } from './tabs-default-props.constant'
import { TABS_CLASS_COMPOSERS, TABS_CLASS_SLOTS } from './tabs-class-slots.constant'

export const TABS_LAYERED_CLASSES = createUIClassResolver('tabs', {
  slots: TABS_CLASS_SLOTS,
  compose: TABS_CLASS_COMPOSERS,
  defaults: TABS_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

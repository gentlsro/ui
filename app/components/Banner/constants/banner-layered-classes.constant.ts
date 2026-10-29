import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { BANNER_DEFAULT_PROPS } from './banner-default-props.constant'
import { BANNER_CLASS_COMPOSERS, BANNER_CLASS_SLOTS } from './banner-class-slots.constant'

export const BANNER_LAYERED_CLASSES = createUIClassResolver('banner', {
  slots: BANNER_CLASS_SLOTS,
  compose: BANNER_CLASS_COMPOSERS,
  defaults: BANNER_DEFAULT_PROPS.ui,
}, () => uiClassLayers)

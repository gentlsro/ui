import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'
import { SCROLLER_DEFAULT_PROPS } from './scroller-default-props.constant'
import { SCROLLER_CLASS_COMPOSERS, SCROLLER_CLASS_SLOTS } from './scroller-class-slots.constant'

export const HORIZONTAL_SCROLLER_LAYERED_CLASSES = createUIClassResolver('horizontalScroller', {
  slots: {
    containerClass: SCROLLER_CLASS_SLOTS.horizontalContainerClass,
    contentClass: SCROLLER_CLASS_SLOTS.contentClass,
    arrowClass: SCROLLER_CLASS_SLOTS.arrowClass,
  },
  compose: {
    containerClass: SCROLLER_CLASS_COMPOSERS.horizontalContainerClass,
    contentClass: SCROLLER_CLASS_COMPOSERS.contentClass,
    arrowClass: SCROLLER_CLASS_COMPOSERS.arrowClass,
  },
  defaults: {
    containerClass: SCROLLER_DEFAULT_PROPS.ui.horizontalContainerClass,
    contentClass: SCROLLER_DEFAULT_PROPS.ui.contentClass,
    arrowClass: SCROLLER_DEFAULT_PROPS.ui.arrowClass,
  },
}, () => uiClassLayers)

export const VERTICAL_SCROLLER_LAYERED_CLASSES = createUIClassResolver('verticalScroller', {
  slots: {
    containerClass: SCROLLER_CLASS_SLOTS.verticalContainerClass,
    contentClass: SCROLLER_CLASS_SLOTS.verticalContentClass,
    arrowClass: SCROLLER_CLASS_SLOTS.arrowClass,
  },
  compose: {
    containerClass: SCROLLER_CLASS_COMPOSERS.verticalContainerClass,
    contentClass: SCROLLER_CLASS_COMPOSERS.verticalContentClass,
    arrowClass: SCROLLER_CLASS_COMPOSERS.arrowClass,
  },
  defaults: {
    containerClass: SCROLLER_DEFAULT_PROPS.ui.verticalContainerClass,
    contentClass: SCROLLER_DEFAULT_PROPS.ui.verticalContentClass,
    arrowClass: SCROLLER_DEFAULT_PROPS.ui.arrowClass,
  },
}, () => uiClassLayers)

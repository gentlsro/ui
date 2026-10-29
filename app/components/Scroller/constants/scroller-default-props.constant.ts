// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const SCROLLER_CLASS_SLOTS = {
  horizontalContainerClass() {
    const base = 'flex relative overflow-hidden'

    return {
      base,
    } as const
  },

  verticalContainerClass() {
    const base = 'flex flex-col relative items-center overflow-hidden'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'flex grow overflow-auto'

    return {
      base,
    } as const
  },

  verticalContentClass() {
    const base = 'flex flex-col flex-1 overflow-auto w-full'

    return {
      base,
    } as const
  },

  arrowClass() {
    const base = 'color-ca dark:hover:color-white hover:color-black'

    return {
      base,
    } as const
  },
}

type ScrollerSlots<K extends keyof typeof SCROLLER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SCROLLER_CLASS_SLOTS[K]>>

export const SCROLLER_CLASS_COMPOSERS = {
  horizontalContainerClass(slots: ScrollerSlots<'horizontalContainerClass'>) {
    return slots.base
  },

  verticalContainerClass(slots: ScrollerSlots<'verticalContainerClass'>) {
    return slots.base
  },

  contentClass(slots: ScrollerSlots<'contentClass'>) {
    return slots.base
  },

  verticalContentClass(slots: ScrollerSlots<'verticalContentClass'>) {
    return slots.base
  },

  arrowClass(slots: ScrollerSlots<'arrowClass'>) {
    return slots.base
  },
}

export const HORIZONTAL_SCROLLER_DEFAULT_PROPS = {
  ui: createUIClassResolver('horizontalScroller', {
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
  }, () => uiClassLayers),
}

export const VERTICAL_SCROLLER_DEFAULT_PROPS = {
  ui: createUIClassResolver('verticalScroller', {
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
  }, () => uiClassLayers),
}

// Preserve the shared Scroller API while each direction has its own layer config.
export const SCROLLER_DEFAULT_PROPS = {
  ui: {
    get horizontalContainerClass() {
      return HORIZONTAL_SCROLLER_DEFAULT_PROPS.ui.containerClass
    },
    get verticalContainerClass() {
      return VERTICAL_SCROLLER_DEFAULT_PROPS.ui.containerClass
    },
    get contentClass() {
      return HORIZONTAL_SCROLLER_DEFAULT_PROPS.ui.contentClass
    },
    get verticalContentClass() {
      return VERTICAL_SCROLLER_DEFAULT_PROPS.ui.contentClass
    },
    get arrowClass() {
      return HORIZONTAL_SCROLLER_DEFAULT_PROPS.ui.arrowClass
    },
  },
}

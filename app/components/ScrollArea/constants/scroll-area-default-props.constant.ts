// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const SCROLL_AREA_CLASS_SLOTS = {
  containerClass() {
    const base = 'overflow-hidden'

    return {
      base,
    } as const
  },
}

type ScrollAreaSlots<K extends keyof typeof SCROLL_AREA_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SCROLL_AREA_CLASS_SLOTS[K]>>

export const SCROLL_AREA_CLASS_COMPOSERS = {
  containerClass(slots: ScrollAreaSlots<'containerClass'>) {
    return slots.base
  },
}

export const SCROLL_AREA_DEFAULT_PROPS = {
  ui: createUIClassResolver('scrollArea', {
    slots: SCROLL_AREA_CLASS_SLOTS,
    compose: SCROLL_AREA_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

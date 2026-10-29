// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

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

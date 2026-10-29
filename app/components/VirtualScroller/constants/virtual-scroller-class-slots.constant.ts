// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const VIRTUAL_SCROLLER_CLASS_SLOTS = {
  containerClass() {
    const base = ''

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'h-full'

    return {
      base,
    } as const
  },

  rowClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type VirtualScrollerSlots<K extends keyof typeof VIRTUAL_SCROLLER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof VIRTUAL_SCROLLER_CLASS_SLOTS[K]>>

export const VIRTUAL_SCROLLER_CLASS_COMPOSERS = {
  containerClass(slots: VirtualScrollerSlots<'containerClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: VirtualScrollerSlots<'contentClass'>) {
    return `${slots.base}`
  },

  rowClass(slots: VirtualScrollerSlots<'rowClass'>) {
    return `${slots.base}`
  },
}

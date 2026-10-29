// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS = {
  rowClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type VirtualScrollerVerticalSlots<K extends keyof typeof VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS[K]>>

export const VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS = {
  rowClass(slots: VirtualScrollerVerticalSlots<'rowClass'>) {
    return `${slots.base}`
  },
}

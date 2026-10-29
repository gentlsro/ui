// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const SELECTOR_CLASS_SLOTS = {
  innerClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type SelectorSlots<K extends keyof typeof SELECTOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SELECTOR_CLASS_SLOTS[K]>>

export const SELECTOR_CLASS_COMPOSERS = {
  innerClass(slots: SelectorSlots<'innerClass'>) {
    return `${slots.base}`
  },
}

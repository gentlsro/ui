// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const VALUE_FORMATTER_CLASS_SLOTS = {
  containerClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type ValueFormatterSlots<K extends keyof typeof VALUE_FORMATTER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof VALUE_FORMATTER_CLASS_SLOTS[K]>>

export const VALUE_FORMATTER_CLASS_COMPOSERS = {
  containerClass(slots: ValueFormatterSlots<'containerClass'>) {
    return `${slots.base}`
  },
}

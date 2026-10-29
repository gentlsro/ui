// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const CHIP_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex gap-2 items-center'
    const border = 'border-px border-ca rounded-custom'
    const size = 'h-5 p-y-3px p-l-2'

    return {
      base,
      border,
      size,
    } as const
  },

  labelClass() {
    const base = 'leading-tight truncate grow'
    const size = 'font-rem-12'

    return {
      base,
      size,
    } as const
  },
}

type ChipSlots<K extends keyof typeof CHIP_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CHIP_CLASS_SLOTS[K]>>

export const CHIP_CLASS_COMPOSERS = {
  containerClass(slots: ChipSlots<'containerClass'>) {
    return `${slots.base} ${slots.border} ${slots.size}`
  },

  labelClass(slots: ChipSlots<'labelClass'>) {
    return `${slots.base} ${slots.size}`
  },
}

// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const HEADING_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex items-center p-x-2 rounded-custom relative'
    const filled = '[&.is-filled]:(p-x-4)'

    return {
      base,
      filled,
    } as const
  },
}

type HeadingSlots<K extends keyof typeof HEADING_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof HEADING_CLASS_SLOTS[K]>>

export const HEADING_CLASS_COMPOSERS = {
  containerClass(slots: HeadingSlots<'containerClass'>) {
    return `${slots.base} ${slots.filled}`
  },
}

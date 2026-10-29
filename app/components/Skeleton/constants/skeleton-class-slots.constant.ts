// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const SKELETON_CLASS_SLOTS = {
  containerClass(_payload: {
    variant: 'wave' | 'pulse' | 'blink'
  }) {
    const base = 'relative cursor-wait bg-ca'

    // Variant states via CSS selectors
    const pulse = '[&.variant--pulse]:(animate-pulse)'
    const wave = '[&.variant--wave]:(overflow-hidden z-1)'
    const blink = '[&.variant--blink]:(overflow-hidden z-1)'

    return {
      base,
      pulse,
      wave,
      blink,
    } as const
  },
}

type SkeletonSlots<K extends keyof typeof SKELETON_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SKELETON_CLASS_SLOTS[K]>>

export const SKELETON_CLASS_COMPOSERS = {
  containerClass(slots: SkeletonSlots<'containerClass'>, payload: {
    variant: 'wave' | 'pulse' | 'blink'
  }) {
    const { variant } = payload

    return `${slots.base} ${{ pulse: slots.pulse, wave: slots.wave, blink: slots.blink }[variant]}`
  },
}

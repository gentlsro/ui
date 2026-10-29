// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const MARQUEE_CLASS_SLOTS = {
  containerClass() {
    const base = 'group flex gap-$gap overflow-hidden p-2'
    const vertical = '[&.is-vertical]:(flex-col)'

    return {
      base,
      vertical,
    } as const
  },

  contentClass(payload: {
    pauseOnHover: boolean
    vertical: boolean
  }) {
    const { pauseOnHover, vertical } = payload

    const base = 'flex shrink-0 gap-$gap'
    const verticalLayout = vertical ? 'flex-col' : ''
    const paused = pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''

    return {
      base,
      verticalLayout,
      paused,
    } as const
  },
}

type MarqueeSlots<K extends keyof typeof MARQUEE_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MARQUEE_CLASS_SLOTS[K]>>

export const MARQUEE_CLASS_COMPOSERS = {
  containerClass(slots: MarqueeSlots<'containerClass'>) {
    return `${slots.base} ${slots.vertical}`
  },

  contentClass(slots: MarqueeSlots<'contentClass'>, _payload: {
    pauseOnHover: boolean
    vertical: boolean
  }) {
    return `${slots.base} ${slots.verticalLayout} ${slots.paused}`.trim()
  },
}

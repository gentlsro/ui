// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const PAGE_WRAPPER_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative ease-out grow z-$zPageWrapper'
    const scrollable = '[&:not(.is-scrollable)]:(overflow-auto flex flex-col)'
    const padded = '[&.is-padded]:m-t-$navHeight'

    return {
      base,
      scrollable,
      padded,
    } as const
  },

  contentClass() {
    const base = 'flex flex-col grow overflow-y-auto overflow-x-hidden'

    return {
      base,
    } as const
  },
}

type PageWrapperSlots<K extends keyof typeof PAGE_WRAPPER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof PAGE_WRAPPER_CLASS_SLOTS[K]>>

export const PAGE_WRAPPER_CLASS_COMPOSERS = {
  containerClass(slots: PageWrapperSlots<'containerClass'>) {
    return `${slots.base} ${slots.scrollable} ${slots.padded}`
  },

  contentClass(slots: PageWrapperSlots<'contentClass'>) {
    return `${slots.base}`
  },
}

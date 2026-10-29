// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const NAVIGATION_CLASS_SLOTS = {
  headerClass() {
    const base = 'relative flex top-0 inset-inline-0 transition-transform ease-linear'
    const shadow = '[&.has-shadow]:(shadow-md)'
    const hidden = '[&.is-hidden]:(-translate-y-100%)'
    const fixed = '[&:not(.is-sticky)]:(fixed)'
    const sticky = '[&.is-sticky]:(sticky)'

    return {
      base,
      shadow,
      hidden,
      fixed,
      sticky,
    } as const
  },

  navigationClass() {
    const base = 'flex items-center bg-white dark:bg-black w-full'

    return {
      base,
    } as const
  },
}

type NavigationSlots<K extends keyof typeof NAVIGATION_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof NAVIGATION_CLASS_SLOTS[K]>>

export const NAVIGATION_CLASS_COMPOSERS = {
  headerClass(slots: NavigationSlots<'headerClass'>) {
    return `${slots.base} ${slots.shadow} ${slots.hidden} ${slots.fixed} ${slots.sticky}`
  },

  navigationClass(slots: NavigationSlots<'navigationClass'>) {
    return `${slots.base}`
  },
}

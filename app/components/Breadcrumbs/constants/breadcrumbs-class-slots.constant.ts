// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const BREADCRUMBS_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex gap-1 items-center'

    return {
      base,
    } as const
  },

  breadcrumbsClass() {
    const base = 'flex gap-x-1 items-center text-sm overflow-auto'
    const responsive = 'lt-lg:(m-t-2px m-b-2px)'
    const mainBar = '[.main-bar_&]:(m-t-0)'

    return {
      base,
      responsive,
      mainBar,
    } as const
  },
}

type BreadcrumbsSlots<K extends keyof typeof BREADCRUMBS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof BREADCRUMBS_CLASS_SLOTS[K]>>

export const BREADCRUMBS_CLASS_COMPOSERS = {
  containerClass(slots: BreadcrumbsSlots<'containerClass'>) {
    return `${slots.base}`
  },

  breadcrumbsClass(slots: BreadcrumbsSlots<'breadcrumbsClass'>) {
    return `${slots.base} ${slots.responsive} ${slots.mainBar}`
  },
}

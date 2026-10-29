// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const PAGE_TITLE_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col gap-6 max-w-screen-lg p-y-4 m-b-2 m-l-2'

    return {
      base,
    } as const
  },

  pageTitleClass() {
    const base = 'flex gap-2'

    return {
      base,
    } as const
  },

  titleClass() {
    const base = 'grow m-b-0 font-700'

    return {
      base,
    } as const
  },
}

type PageTitleSlots<K extends keyof typeof PAGE_TITLE_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof PAGE_TITLE_CLASS_SLOTS[K]>>

export const PAGE_TITLE_CLASS_COMPOSERS = {
  containerClass(slots: PageTitleSlots<'containerClass'>) {
    return `${slots.base}`
  },

  pageTitleClass(slots: PageTitleSlots<'pageTitleClass'>) {
    return `${slots.base}`
  },

  titleClass(slots: PageTitleSlots<'titleClass'>) {
    return `${slots.base}`
  },
}

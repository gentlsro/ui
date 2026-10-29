// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const MINI_CARD_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex rounded-custom p-x-2 p-y-1.5 gap-3'

    return {
      base,
    } as const
  },

  iconContainerClass() {
    const base = 'shrink-0 m-t-.5'

    return {
      base,
    } as const
  },

  iconClass() {
    const base = 'h-5 w-5 m-t-1'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'w-full leading-4.5 flex flex-col'

    return {
      base,
    } as const
  },

  labelClass() {
    const base = 'text-caption color-slate-600 dark:color-slate-300 font-rem-12 p-b-1'

    return {
      base,
    } as const
  },

  valueClass() {
    const base = 'font-rem-14 text-wrap break-words whitespace-pre-line'
    const modified = '[&.is-modified]:(p-l-1 rounded-custom)'

    return {
      base,
      modified,
    } as const
  },

  previousValueClass() {
    const base = 'color-purple-500 dark:color-purple-600 font-rem-16 overflow-wrap-break-word whitespace-pre-line'

    return {
      base,
    } as const
  },
}

type MiniCardSlots<K extends keyof typeof MINI_CARD_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MINI_CARD_CLASS_SLOTS[K]>>

export const MINI_CARD_CLASS_COMPOSERS = {
  containerClass(slots: MiniCardSlots<'containerClass'>) {
    return `${slots.base}`
  },

  iconContainerClass(slots: MiniCardSlots<'iconContainerClass'>) {
    return `${slots.base}`
  },

  iconClass(slots: MiniCardSlots<'iconClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: MiniCardSlots<'contentClass'>) {
    return `${slots.base}`
  },

  labelClass(slots: MiniCardSlots<'labelClass'>) {
    return `${slots.base}`
  },

  valueClass(slots: MiniCardSlots<'valueClass'>) {
    return `${slots.base} ${slots.modified}`
  },

  previousValueClass(slots: MiniCardSlots<'previousValueClass'>) {
    return `${slots.base}`
  },
}

export const MINI_CARD_DEFAULT_PROPS = {
  ui: createUIClassResolver('miniCard', {
    slots: MINI_CARD_CLASS_SLOTS,
    compose: MINI_CARD_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

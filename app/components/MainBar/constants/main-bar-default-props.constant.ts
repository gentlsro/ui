// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const MAIN_BAR_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex relative flex-col gap-x-2 p-t-2 z-$zMainBar w-full shrink-0 bg-white dark:bg-darker p-b-2'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'flex gap-x-4 grow items-center rounded-custom'

    return {
      base,
    } as const
  },

  titleWrapperClass() {
    const base = 'flex flex-col grow overflow-auto relative rounded-custom'

    return {
      base,
    } as const
  },

  titleClass() {
    const base = ''

    return {
      base,
    } as const
  },

  subtitleClass() {
    const base = 'text-caption p-x-4 p-b-2 m-t--1'

    return {
      base,
    } as const
  },

  actionsClass() {
    const base = 'flex flex-col self-start m-t-1 m-x-2'

    return {
      base,
    } as const
  },
}

type MainBarSlots<K extends keyof typeof MAIN_BAR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MAIN_BAR_CLASS_SLOTS[K]>>

export const MAIN_BAR_CLASS_COMPOSERS = {
  containerClass(slots: MainBarSlots<'containerClass'>) {
    return slots.base
  },

  contentClass(slots: MainBarSlots<'contentClass'>) {
    return slots.base
  },

  titleWrapperClass(slots: MainBarSlots<'titleWrapperClass'>) {
    return slots.base
  },

  titleClass(slots: MainBarSlots<'titleClass'>) {
    return slots.base
  },

  subtitleClass(slots: MainBarSlots<'subtitleClass'>) {
    return slots.base
  },

  actionsClass(slots: MainBarSlots<'actionsClass'>) {
    return slots.base
  },
}

export const MAIN_BAR_DEFAULT_PROPS = {
  ui: createUIClassResolver('mainBar', {
    slots: MAIN_BAR_CLASS_SLOTS,
    compose: MAIN_BAR_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

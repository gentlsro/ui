// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const BURGER_CLASS_SLOTS = {
  containerClass(_payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
  }) {
    const base = 'p-0 self-center rounded-2 flex flex-center'

    // Size variants
    const sizes = {
      xs: 'w-8 h-8',
      xm: 'w-8.5 h-8.5',
      sm: 'w-9 h-9',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    } as const

    return {
      base,
      sizes,
    } as const
  },

  burgerClass(_payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
  }) {
    const base = 'rotate-0 transition-transform ease-in-out duration-500 cursor-pointer relative text-black dark:text-white'

    // Size variants
    const sizes = {
      xs: 'w-7 h-7',
      xm: 'w-7.5 h-7.5',
      sm: 'w-8 h-8',
      md: 'w-9 h-9',
      lg: 'w-10 h-10',
    } as const

    return {
      base,
      sizes,
    } as const
  },
}

type BurgerSlots<K extends keyof typeof BURGER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof BURGER_CLASS_SLOTS[K]>>

export const BURGER_CLASS_COMPOSERS = {
  containerClass(slots: BurgerSlots<'containerClass'>, payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.sizes[sizeProp]}`
  },

  burgerClass(slots: BurgerSlots<'burgerClass'>, payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.sizes[sizeProp]}`
  },
}

export const BURGER_DEFAULT_PROPS = {
  ui: createUIClassResolver('burger', {
    slots: BURGER_CLASS_SLOTS,
    compose: BURGER_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

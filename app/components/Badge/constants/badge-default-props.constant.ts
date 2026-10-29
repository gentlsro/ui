// @unocss-include

import type { IBadgeProps } from '../types/badge-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const BADGE_CLASS_SLOTS = {
  containerClass() {
    const base = 'rounded-2 flex flex-center'
    const font = 'font-normal font-rem-12 font-mono leading-3 min-w-5 text-center'
    const position = 'absolute right--1 top--1'
    const border = 'border-2 border-inherit'

    return {
      base,
      font,
      position,
      border,
      inline: (`${base} ${font} ${border} min-w-5 p-x-1.5 p-y-2px`) as string,
      topRight: (`${base} ${position} ${border} font-rem-10 min-w-18px leading-10px p-2px`) as string,
      noPosition: (`${base} ${font} ${border} min-w-5 p-x-1.5 p-y-2px`) as string,
    } as const
  },
}

type BadgeSlots<K extends keyof typeof BADGE_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof BADGE_CLASS_SLOTS[K]>>

export const BADGE_CLASS_COMPOSERS = {
  containerClass(slots: BadgeSlots<'containerClass'>) {
    return `${slots.base} ${slots.font} ${slots.position} ${slots.border}`
  },
}

/** Recompute named slots after layer patches without accessor allocation. */
export const BADGE_CLASS_DERIVED = {
  containerClass: {
    inline(slots: BadgeSlots<'containerClass'>): string {
      return `${slots.base} ${slots.font} ${slots.border} min-w-5 p-x-1.5 p-y-2px`
    },
    topRight(slots: BadgeSlots<'containerClass'>): string {
      return `${slots.base} ${slots.position} ${slots.border} font-rem-10 min-w-18px leading-10px p-2px`
    },
    noPosition(slots: BadgeSlots<'containerClass'>): string {
      return `${slots.base} ${slots.font} ${slots.border} min-w-5 p-x-1.5 p-y-2px`
    },
  },
}

export const BADGE_DEFAULT_PROPS = {
  ui: createUIClassResolver('badge', {
    slots: BADGE_CLASS_SLOTS,
    compose: BADGE_CLASS_COMPOSERS,
    derive: BADGE_CLASS_DERIVED,
  }, () => uiClassLayers),
} satisfies IBadgeProps

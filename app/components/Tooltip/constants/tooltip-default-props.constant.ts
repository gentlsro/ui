// @unocss-include

import type { ITooltipProps } from '../types/tooltip-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const TOOLTIP_CLASS_SLOTS = {
  containerClass() {
    const base = 'p-x-2 p-y-1 rounded-custom border-custom border-ca'
    const bg = 'dark:bg-dark-950 bg-white'
    const font = 'font-rem-13 color-ca'
    const noInheritFontStyle = '[&.no-inherit-font-style]:(font-normal normal-case leading-normal font-rem-13)'

    return {
      base,
      bg,
      font,
      noInheritFontStyle,
    } as const
  },

  contentClass() {
    const base = 'flex flex-col gap-2px'
    const maxWidth = 'max-w-60'

    return {
      base,
      maxWidth,
    } as const
  },

  titleClass() {
    const base = 'font-rem-14 font-semibold'

    return {
      base,
    } as const
  },

  descriptionClass() {
    const base = 'font-rem-12 text-caption leading-tight'

    return {
      base,
    } as const
  },

  arrowClass() {
    const base = 'absolute w-2 h-2 rotate-45 bg-inherit'

    return {
      base,
    } as const
  },
}

type TooltipSlots<K extends keyof typeof TOOLTIP_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof TOOLTIP_CLASS_SLOTS[K]>>

export const TOOLTIP_CLASS_COMPOSERS = {
  containerClass(slots: TooltipSlots<'containerClass'>) {
    return `${slots.base} ${slots.bg} ${slots.font} ${slots.noInheritFontStyle}`
  },

  contentClass(slots: TooltipSlots<'contentClass'>) {
    return `${slots.base} ${slots.maxWidth}`
  },

  titleClass(slots: TooltipSlots<'titleClass'>) {
    return `${slots.base}`
  },

  descriptionClass(slots: TooltipSlots<'descriptionClass'>) {
    return `${slots.base}`
  },

  arrowClass(slots: TooltipSlots<'arrowClass'>) {
    return `${slots.base}`
  },
}

export const TOOLTIP_DEFAULT_PROPS = {
  ui: createUIClassResolver('tooltip', {
    slots: TOOLTIP_CLASS_SLOTS,
    compose: TOOLTIP_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies ITooltipProps

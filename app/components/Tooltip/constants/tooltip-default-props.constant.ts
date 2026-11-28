// @unocss-include

// Types
import type { ITooltipProps } from '../types/tooltip-props.type'

export const TOOLTIP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'p-x-2 p-y-1 rounded-custom border-custom border-ca'
      // (a scope's surface, else white / dark-950)
      const bg = 'bg-[rgb(var(--color-surface-rgb,255_255_255))] dark:bg-[rgb(var(--color-surface-rgb,8_8_8))]'
      const font = 'font-rem-13 color-ca'
      const noInheritFontStyle = '[&.no-inherit-font-style]:(font-normal normal-case leading-normal font-rem-13)'

      return {
        base,
        bg,
        font,
        noInheritFontStyle,
        all: `${base} ${bg} ${font} ${noInheritFontStyle}`,
      } as const
    },

    contentClass() {
      const base = 'flex flex-col gap-2px'
      const maxWidth = 'max-w-60'

      return {
        base,
        maxWidth,
        all: `${base} ${maxWidth}`,
      } as const
    },

    titleClass() {
      const base = 'font-rem-14 font-semibold'

      return {
        base,
        all: `${base}`,
      } as const
    },

    descriptionClass() {
      const base = 'font-rem-12 text-caption leading-tight'

      return {
        base,
        all: `${base}`,
      } as const
    },

    arrowClass() {
      const base = 'absolute w-2 h-2 rotate-45 bg-inherit'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies ITooltipProps

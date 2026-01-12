// @unocss-include

// Types
import type { ITooltipProps } from '../types/tooltip-props.type'

export const TOOLTIP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'p-x-2 p-y-1 rounded-custom border-custom border-ca'
      const bg = 'dark:bg-darker bg-white'
      const font = 'font-size-$Tooltip-font-size color-$Tooltip-font-color'
      const noInheritFontStyle = '[&.no-inherit-font-style]:(font-normal normal-case text-base)'

      return {
        base,
        bg,
        font,
        noInheritFontStyle,
        all: `${base} ${bg} ${font} ${noInheritFontStyle}`,
      } as const
    },

    contentClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },

    titleClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },

    descriptionClass() {
      const base = ''

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

// @unocss-include

// Types
import type { IBadgeProps } from '../types/badge-props.type'

export const BADGE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'rounded-2 flex flex-center'
      const font = 'font-normal font-rem-12 font-mono leading-3 min-w-5 text-center'
      const position = 'absolute right--1 top--1'
      const border = 'border-2 border-inherit'

      // Compound classes
      const inline = `${base} ${font} ${border} min-w-5 p-x-1.5 p-y-2px` as const
      const topRight = `${base} ${position} ${border} font-rem-10 min-w-18px leading-10px p-2px` as const

      return {
        base,
        font,
        position,
        border,
        inline,
        topRight,
        all: `${base} ${font} ${position} ${border}`,
      } as const
    },
  },
} satisfies IBadgeProps

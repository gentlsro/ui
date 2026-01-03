// @unocss-include
import type { IChipProps } from '../types/chip-props.type'

export const CHIP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex gap-2 items-center'
      const border = 'border-px border-ca rounded-custom'
      const size = 'h-5 p-y-3px p-l-2'

      return {
        base,
        border,
        size,
        all: `${base} ${border} ${size}`,
      } as const
    },

    labelClass() {
      const base = 'leading-none truncate grow'
      const size = 'font-rem-12'

      return {
        base,
        size,
        all: `${base} ${size}`,
      } as const
    },
  },
} satisfies IChipProps

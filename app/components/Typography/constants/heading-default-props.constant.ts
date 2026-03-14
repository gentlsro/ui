// @unocss-include

// Types
import type { IHeadingProps } from '../types/heading-props.type'

export const HEADING_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex items-center p-x-2 rounded-custom relative'
      const filled = '[&.is-filled]:(p-x-4)'

      return {
        base,
        filled,
        all: `${base} ${filled}`,
      } as const
    },
  },
} satisfies IHeadingProps

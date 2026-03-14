// @unocss-include

// Types
import type { IButtonGroupProps } from '../types/button-group-props.type'

export const BUTTON_GROUP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex rounded-full border-1 border-ca'

      return {
        base,
        all: `${base}`,
      } as const
    },

    activeClass() {
      const base = 'bg-primary color-white'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies Partial<IButtonGroupProps>

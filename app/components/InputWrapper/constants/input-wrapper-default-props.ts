// @unocss-include

// Types
import type { IInputWrapperProps } from '../types/input-wrapper-props.type'

export const INPUT_WRAPPER_DEFAULT_PROPS = {
  ui: {
    appendClass() {
      const base = 'flex gap-1 flex-center p-x-2 shrink-0'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },

    inputContainerClass() {
      const base = 'bg-white dark:bg-black'

      return {
        base,
        all: `${base}`,
      } as const
    },

    inputInnerContainerClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },

    inputClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IInputWrapperProps

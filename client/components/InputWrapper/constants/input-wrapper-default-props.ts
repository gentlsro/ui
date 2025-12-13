// @unocss-include

// Types
import type { IInputWrapperProps } from '../types/input-wrapper-props.type'

export const INPUT_WRAPPER_DEFAULT_PROPS = {
  ui: {
    appendClass() {
      const base = 'flex gap-1 items-center p-x-2'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    contentClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputContainerClass() {
      const base = 'bg-white dark:bg-black'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputInnerContainerClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies IInputWrapperProps

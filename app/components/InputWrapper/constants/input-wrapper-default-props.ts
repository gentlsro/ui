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

    errorClass() {
      const base = 'inline-block p-b-1 transition-height duration-150 color-negative font-rem-12'

      return {
        base,
        all: `${base}`,
      } as const
    },

    hintClass() {
      const base = 'color-ca font-rem-12 leading-tight p-y-2px p-x-2'

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

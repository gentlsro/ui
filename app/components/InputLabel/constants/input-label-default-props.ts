// @unocss-include

// Types
import type { IInputLabelProps } from '../types/input-label-props.type'

export const INPUT_LABEL_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const base = 'color-truegray-600 active:color-blue-500 dark:color-truegray-300 dark:active:color-blue-500'

      /**
       * Applied while the wrapper (= the input) is focused.
       *
       * To customize it, compose on top of `base` instead of `all` with e.g.
       * `group-focus-within/wrapper:(color-red dark:color-blue)`
       */
      const activeColor = 'group-focus-within/wrapper:color-primary'

      return {
        base,
        activeColor,
        all: `${base} ${activeColor}`,
      } as const
    },
  },
} satisfies IInputLabelProps

// @unocss-include

// Types
import type { IInputLabelProps } from '../types/input-label-props.type'

export const INPUT_LABEL_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const base = 'color-truegray-600 active:color-blue-500 dark:color-truegray-300 dark:active:color-blue-500'

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies IInputLabelProps

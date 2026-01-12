// @unocss-include

// Types
import type { IFormProps } from '../types/form-props.type'

export const FORM_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-2 grow overflow-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      const base = 'relative flex flex-col grow p-2 gap-2 overflow-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },

    controlsClass() {
      const base = 'sticky flex items-center shrink-0 gap-2 bottom-0 z-1'
      const border = 'border-t-1 border-ca'
      const background = 'bg-white dark:bg-dark-950'
      const padding = 'p-y-1 p-x-2'

      return {
        base,
        border,
        background,
        padding,
        all: `${base} ${border} ${background} ${padding}`,
      } as const
    },

    submitWrapperClass() {
      const base = 'flex gap-2 relative m-l-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },

    submitClass() {
      const base = 'bg-primary color-white w-40'

      return {
        base,
        all: `${base}`,
      } as const
    },

    cancelClass() {
      const base = 'w-40'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IFormProps


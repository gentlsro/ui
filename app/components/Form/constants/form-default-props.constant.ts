// @unocss-include

// Types
import type { IFormProps } from '../types/form-props.type'

export const FORM_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-2 grow overflow-auto'
      const gap = 'gap-2'

      return {
        base,
        gap,
        all: `${base} ${gap}`,
      } as const
    },

    contentClass() {
      const base = 'relative flex flex-col grow overflow-auto'
      const gap = 'gap-2'
      const padding = 'p-2'

      return {
        base,
        gap,
        padding,
        all: `${base} ${gap} ${padding}`,
      } as const
    },

    controlsClass() {
      const base = 'sticky flex items-center shrink-0 gap-2 bottom-0 z-1'
      const border = 'border-t-1 border-ca [&.is-controls-on-top]:(order-first border-t-0 border-b-1)'
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
      const base = 'flex gap-2 relative'

      // Presets
      const fullWidth = `${base} grow`

      return {
        base,
        fullWidth,
        all: `${base} m-l-auto`,
      } as const
    },

    submitClass() {
      const base = 'bg-primary color-white'

      // Presets
      const fullWidth = `${base} grow`

      return {
        base,
        fullWidth,
        all: `${base} w-40`,
      } as const
    },

    cancelClass() {
      const base = 'w-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IFormProps

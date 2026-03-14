// @unocss-include

// Types
import type { IMiniCardProps } from '../types/mini-card-props.type'

export const MINI_CARD_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex rounded-custom p-x-2 p-y-1.5 gap-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    iconContainerClass() {
      const base = 'shrink-0 m-t-.5'

      return {
        base,
        all: `${base}`,
      } as const
    },

    iconClass() {
      const base = 'color-blue-500 dark:color-blue-700 h-6 w-6'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      const base = 'w-full leading-4.5 flex flex-col'

      return {
        base,
        all: `${base}`,
      } as const
    },

    labelClass() {
      const base = 'text-caption color-slate-600 dark:color-slate-300 font-rem-12 p-b-1'

      return {
        base,
        all: `${base}`,
      } as const
    },

    valueClass() {
      const base = 'font-rem-14 text-wrap break-words whitespace-pre-line'
      const modified = '[&.is-modified]:(p-l-1 rounded-custom)'

      return {
        base,
        modified,
        all: `${base} ${modified}`,
      } as const
    },

    previousValueClass() {
      const base = 'color-purple-500 dark:color-purple-600 font-rem-16 overflow-wrap-break-word whitespace-pre-line'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

// @unocss-include

// Types
import type { INavigationProps } from '../types/navigation-props.type'

export const NAVIGATION_DEFAULT_PROPS = {
  ui: {
    headerClass() {
      const base = 'relative flex top-0 inset-inline-0 transition-transform ease-linear'
      const shadow = '[&.has-shadow]:(shadow-md)'
      const hidden = '[&.is-hidden]:(-translate-y-100%)'
      const initialized = '[&.is-initialized]:(fixed)'
      const sticky = '[&.is-sticky]:(sticky)'

      return {
        base,
        shadow,
        hidden,
        initialized,
        sticky,
        all: `${base} ${shadow} ${hidden} ${initialized} ${sticky}`,
      } as const
    },

    navigationClass() {
      const base = 'flex items-center bg-white dark:bg-black w-full'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies INavigationProps

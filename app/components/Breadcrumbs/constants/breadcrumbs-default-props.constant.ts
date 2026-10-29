// @unocss-include

// Types
import type { IBreadcrumbsProps } from '../types/breadcrumbs-props.type'

export const BREADCRUMBS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex gap-1 items-center'

      return {
        base,
        all: `${base}`,
      } as const
    },

    breadcrumbsClass() {
      const base = 'flex gap-x-1 items-center text-sm overflow-auto'
      const responsive = 'lt-lg:(m-t-2px m-b-2px)'
      const mainBar = '[.main-bar_&]:(m-t-0)'

      return {
        base,
        responsive,
        mainBar,
        all: `${base} ${responsive} ${mainBar}`,
      } as const
    },
  },
} satisfies IBreadcrumbsProps

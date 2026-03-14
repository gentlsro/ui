// @unocss-include

// Types
import type { IPageWrapperProps } from '../types/page-wrapper-props.type'

export const PAGE_WRAPPER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'ease-out grow z-$zPageWrapper'
      const scrollable = '[&:not(.is-scrollable)]:(overflow-auto flex flex-col)'
      const padded = '[&.is-padded]:m-t-$navHeight'

      return {
        base,
        scrollable,
        padded,
        all: `${base} ${scrollable} ${padded}`,
      } as const
    },

    contentClass() {
      const base = 'flex flex-col grow overflow-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IPageWrapperProps

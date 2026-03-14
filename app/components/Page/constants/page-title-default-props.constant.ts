// @unocss-include

// Types
import type { IPageTitleProps } from '../types/page-title-props.type'

export const PAGE_TITLE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-6 max-w-screen-lg p-y-4 m-b-2 m-l-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    pageTitleClass() {
      const base = 'flex gap-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    titleClass() {
      const base = 'grow m-b-0 font-700'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IPageTitleProps


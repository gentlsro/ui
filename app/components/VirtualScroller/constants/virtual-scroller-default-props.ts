// @unocss-include

import type { IVirtualScrollerProps } from '../types/virtual-scroller-props.type'

export const VIRTUAL_SCROLLER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
    contentClass() {
      const base = 'h-full'

      return {
        base,
        all: `${base}`,
      } as const
    },
    rowClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IVirtualScrollerProps<any>

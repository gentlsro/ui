import type { IVirtualScrollerProps } from '../types/virtual-scroller-props.type'

export const VIRTUAL_SCROLLER_DEFAULT_PROPS = {
  ui: {
    rowClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies IVirtualScrollerProps<any>

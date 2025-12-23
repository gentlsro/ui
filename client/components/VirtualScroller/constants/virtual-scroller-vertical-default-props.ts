// Types
import type { IVirtualScrollerVerticalProps } from '../types/virtual-scroller-vertical-props.type'

export const VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS = {
  ui: {
    rowClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies Omit<IVirtualScrollerVerticalProps<any>, 'rows'>

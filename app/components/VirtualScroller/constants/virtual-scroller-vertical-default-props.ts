// Types
import type { IVirtualScrollerVerticalProps } from '../types/virtual-scroller-vertical-props.type'
import { VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS, VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS } from './virtual-scroller-vertical-class-slots.constant'

export const VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS = {
  ui: {
    rowClass() {
      const slots = VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS.rowClass()

      return withClassPicker({ ...slots, all: VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS.rowClass(slots) } as const)
    },
  },
} satisfies Omit<IVirtualScrollerVerticalProps<any>, 'rows'>

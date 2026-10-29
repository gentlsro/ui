// @unocss-include

import type { IVirtualScrollerProps } from '../types/virtual-scroller-props.type'
import { VIRTUAL_SCROLLER_CLASS_COMPOSERS, VIRTUAL_SCROLLER_CLASS_SLOTS } from './virtual-scroller-class-slots.constant'

export const VIRTUAL_SCROLLER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = VIRTUAL_SCROLLER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: VIRTUAL_SCROLLER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
    contentClass() {
      const slots = VIRTUAL_SCROLLER_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: VIRTUAL_SCROLLER_CLASS_COMPOSERS.contentClass(slots) } as const)
    },
    rowClass() {
      const slots = VIRTUAL_SCROLLER_CLASS_SLOTS.rowClass()

      return withClassPicker({ ...slots, all: VIRTUAL_SCROLLER_CLASS_COMPOSERS.rowClass(slots) } as const)
    },
  },
} satisfies IVirtualScrollerProps<any>

// @unocss-include

// Types
import type { IPageWrapperProps } from '../types/page-wrapper-props.type'
import { PAGE_WRAPPER_CLASS_COMPOSERS, PAGE_WRAPPER_CLASS_SLOTS } from './page-wrapper-class-slots.constant'

export const PAGE_WRAPPER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = PAGE_WRAPPER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: PAGE_WRAPPER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = PAGE_WRAPPER_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: PAGE_WRAPPER_CLASS_COMPOSERS.contentClass(slots) } as const)
    },
  },
} satisfies IPageWrapperProps

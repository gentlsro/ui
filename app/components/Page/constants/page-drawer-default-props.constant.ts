// @unocss-include

// Types
import type { IPageDrawerProps } from '../types/page-drawer-props.type'
import { PAGE_DRAWER_CLASS_COMPOSERS, PAGE_DRAWER_CLASS_SLOTS } from './page-drawer-class-slots.constant'

export const PAGE_DRAWER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = PAGE_DRAWER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: PAGE_DRAWER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = PAGE_DRAWER_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: PAGE_DRAWER_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    bottomClass() {
      const slots = PAGE_DRAWER_CLASS_SLOTS.bottomClass()

      return withClassPicker({ ...slots, all: PAGE_DRAWER_CLASS_COMPOSERS.bottomClass(slots) } as const)
    },

    fillerClass() {
      const slots = PAGE_DRAWER_CLASS_SLOTS.fillerClass()

      return withClassPicker({ ...slots, all: PAGE_DRAWER_CLASS_COMPOSERS.fillerClass(slots) } as const)
    },
  },
} satisfies IPageDrawerProps

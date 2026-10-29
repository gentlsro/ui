// @unocss-include

// Types
import type { IPageTitleProps } from '../types/page-title-props.type'
import { PAGE_TITLE_CLASS_COMPOSERS, PAGE_TITLE_CLASS_SLOTS } from './page-title-class-slots.constant'

export const PAGE_TITLE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = PAGE_TITLE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: PAGE_TITLE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    pageTitleClass() {
      const slots = PAGE_TITLE_CLASS_SLOTS.pageTitleClass()

      return withClassPicker({ ...slots, all: PAGE_TITLE_CLASS_COMPOSERS.pageTitleClass(slots) } as const)
    },

    titleClass() {
      const slots = PAGE_TITLE_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: PAGE_TITLE_CLASS_COMPOSERS.titleClass(slots) } as const)
    },
  },
} satisfies IPageTitleProps

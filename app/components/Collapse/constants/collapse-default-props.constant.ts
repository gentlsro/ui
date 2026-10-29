import { COLLAPSE_CLASS_COMPOSERS, COLLAPSE_CLASS_SLOTS } from './collapse-class-slots.constant'

// @unocss-include

export const COLLAPSE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = COLLAPSE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    headerClass() {
      const slots = COLLAPSE_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    headerRightClass() {
      const slots = COLLAPSE_CLASS_SLOTS.headerRightClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.headerRightClass(slots) } as const)
    },

    titleClass() {
      const slots = COLLAPSE_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    subtitleClass() {
      const slots = COLLAPSE_CLASS_SLOTS.subtitleClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.subtitleClass(slots) } as const)
    },

    expandIconClass() {
      const slots = COLLAPSE_CLASS_SLOTS.expandIconClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.expandIconClass(slots) } as const)
    },

    textClass() {
      const slots = COLLAPSE_CLASS_SLOTS.textClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.textClass(slots) } as const)
    },

    contentClass() {
      const slots = COLLAPSE_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    contentInnerClass() {
      const slots = COLLAPSE_CLASS_SLOTS.contentInnerClass()

      return withClassPicker({ ...slots, all: COLLAPSE_CLASS_COMPOSERS.contentInnerClass(slots) } as const)
    },
  },
}

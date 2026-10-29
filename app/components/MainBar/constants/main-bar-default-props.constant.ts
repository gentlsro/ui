import { MAIN_BAR_CLASS_COMPOSERS, MAIN_BAR_CLASS_SLOTS } from './main-bar-class-slots.constant'

// @unocss-include

export const MAIN_BAR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    titleWrapperClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.titleWrapperClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.titleWrapperClass(slots) } as const)
    },

    titleClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    subtitleClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.subtitleClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.subtitleClass(slots) } as const)
    },

    actionsClass() {
      const slots = MAIN_BAR_CLASS_SLOTS.actionsClass()

      return withClassPicker({ ...slots, all: MAIN_BAR_CLASS_COMPOSERS.actionsClass(slots) } as const)
    },
  },
}

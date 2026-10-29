import { YEAR_SELECTOR_CLASS_COMPOSERS, YEAR_SELECTOR_CLASS_SLOTS } from './year-selector-class-slots.constant'

// @unocss-include

export const YEAR_SELECTOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = YEAR_SELECTOR_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: YEAR_SELECTOR_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    previousBtnClass() {
      const slots = YEAR_SELECTOR_CLASS_SLOTS.previousBtnClass()

      return withClassPicker({ ...slots, all: YEAR_SELECTOR_CLASS_COMPOSERS.previousBtnClass(slots) } as const)
    },

    nextBtnClass() {
      const slots = YEAR_SELECTOR_CLASS_SLOTS.nextBtnClass()

      return withClassPicker({ ...slots, all: YEAR_SELECTOR_CLASS_COMPOSERS.nextBtnClass(slots) } as const)
    },

    menuContainerClass() {
      const slots = YEAR_SELECTOR_CLASS_SLOTS.menuContainerClass()

      return withClassPicker({ ...slots, all: YEAR_SELECTOR_CLASS_COMPOSERS.menuContainerClass(slots) } as const)
    },

    yearBtnClass() {
      const slots = YEAR_SELECTOR_CLASS_SLOTS.yearBtnClass()

      return withClassPicker({ ...slots, all: YEAR_SELECTOR_CLASS_COMPOSERS.yearBtnClass(slots) } as const)
    },
  },
}

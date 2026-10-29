import { MONTH_SELECTOR_CLASS_COMPOSERS, MONTH_SELECTOR_CLASS_SLOTS } from './month-selector-class-slots.constant'

// @unocss-include

export const MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    previousBtnClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.previousBtnClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.previousBtnClass(slots) } as const)
    },

    currentBtnClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.currentBtnClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.currentBtnClass(slots) } as const)
    },

    nextBtnClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.nextBtnClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.nextBtnClass(slots) } as const)
    },

    gridContainerClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.gridContainerClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.gridContainerClass(slots) } as const)
    },

    monthBtnClass() {
      const slots = MONTH_SELECTOR_CLASS_SLOTS.monthBtnClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_CLASS_COMPOSERS.monthBtnClass(slots) } as const)
    },
  },
}

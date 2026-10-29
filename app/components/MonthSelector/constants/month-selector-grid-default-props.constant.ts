import { MONTH_SELECTOR_GRID_CLASS_COMPOSERS, MONTH_SELECTOR_GRID_CLASS_SLOTS } from './month-selector-grid-class-slots.constant'

// @unocss-include

export const MONTH_SELECTOR_GRID_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = MONTH_SELECTOR_GRID_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_GRID_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    monthBtnClass() {
      const slots = MONTH_SELECTOR_GRID_CLASS_SLOTS.monthBtnClass()

      return withClassPicker({ ...slots, all: MONTH_SELECTOR_GRID_CLASS_COMPOSERS.monthBtnClass(slots) } as const)
    },
  },
}

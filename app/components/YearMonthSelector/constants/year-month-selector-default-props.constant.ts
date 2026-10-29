import { YEAR_MONTH_SELECTOR_CLASS_COMPOSERS, YEAR_MONTH_SELECTOR_CLASS_SLOTS } from './year-month-selector-class-slots.constant'

// @unocss-include

export const YEAR_MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: {
    pickerIconClass() {
      const slots = YEAR_MONTH_SELECTOR_CLASS_SLOTS.pickerIconClass()

      return withClassPicker({ ...slots, all: YEAR_MONTH_SELECTOR_CLASS_COMPOSERS.pickerIconClass(slots) } as const)
    },
  },
}

import { SEPARATOR_CLASS_COMPOSERS, SEPARATOR_CLASS_SLOTS } from './separator-class-slots.constant'

// @unocss-include

export const SEPARATOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = SEPARATOR_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: SEPARATOR_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
}

import { BURGER_CLASS_COMPOSERS, BURGER_CLASS_SLOTS } from './burger-class-slots.constant'

// @unocss-include

export const BURGER_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof BURGER_CLASS_SLOTS.containerClass>[0]) {
      const slots = BURGER_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: BURGER_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    burgerClass(payload: Parameters<typeof BURGER_CLASS_SLOTS.burgerClass>[0]) {
      const slots = BURGER_CLASS_SLOTS.burgerClass(payload)

      return withClassPicker({ ...slots, all: BURGER_CLASS_COMPOSERS.burgerClass(slots, payload) } as const)
    },
  },
}

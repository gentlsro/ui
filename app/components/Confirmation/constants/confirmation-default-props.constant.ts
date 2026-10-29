import { CONFIRMATION_CLASS_COMPOSERS, CONFIRMATION_CLASS_SLOTS } from './confirmation-class-slots.constant'

// @unocss-include

export const CONFIRMATION_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = CONFIRMATION_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: CONFIRMATION_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    checkmarkClass() {
      const slots = CONFIRMATION_CLASS_SLOTS.checkmarkClass()

      return withClassPicker({ ...slots, all: CONFIRMATION_CLASS_COMPOSERS.checkmarkClass(slots) } as const)
    },

    textClass() {
      const slots = CONFIRMATION_CLASS_SLOTS.textClass()

      return withClassPicker({ ...slots, all: CONFIRMATION_CLASS_COMPOSERS.textClass(slots) } as const)
    },

    actionsClass() {
      const slots = CONFIRMATION_CLASS_SLOTS.actionsClass()

      return withClassPicker({ ...slots, all: CONFIRMATION_CLASS_COMPOSERS.actionsClass(slots) } as const)
    },
  },
}

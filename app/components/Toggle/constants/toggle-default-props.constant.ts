import { TOGGLE_CLASS_COMPOSERS, TOGGLE_CLASS_SLOTS } from './toggle-class-slots.constant'

// @unocss-include

export const TOGGLE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = TOGGLE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    toggleClass(payload: Parameters<typeof TOGGLE_CLASS_SLOTS.toggleClass>[0]) {
      const slots = TOGGLE_CLASS_SLOTS.toggleClass(payload)

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.toggleClass(slots, payload) } as const)
    },

    bulletClass(payload: Parameters<typeof TOGGLE_CLASS_SLOTS.bulletClass>[0]) {
      const slots = TOGGLE_CLASS_SLOTS.bulletClass(payload)

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.bulletClass(slots, payload) } as const)
    },

    labelClass(payload: Parameters<typeof TOGGLE_CLASS_SLOTS.labelClass>[0]) {
      const slots = TOGGLE_CLASS_SLOTS.labelClass(payload)

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.labelClass(slots, payload) } as const)
    },

    iconClass() {
      const slots = TOGGLE_CLASS_SLOTS.iconClass()

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.iconClass(slots) } as const)
    },

    focusHelperClass() {
      const slots = TOGGLE_CLASS_SLOTS.focusHelperClass()

      return withClassPicker({ ...slots, all: TOGGLE_CLASS_COMPOSERS.focusHelperClass(slots) } as const)
    },
  },
}

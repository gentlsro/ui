import { CHECKBOX_CLASS_COMPOSERS, CHECKBOX_CLASS_SLOTS } from './checkbox-class-slots.constant'

// @unocss-include

export const CHECKBOX_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof CHECKBOX_CLASS_SLOTS.containerClass>[0]) {
      const slots = CHECKBOX_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: CHECKBOX_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    checkboxClass(payload: Parameters<typeof CHECKBOX_CLASS_SLOTS.checkboxClass>[0]) {
      const slots = CHECKBOX_CLASS_SLOTS.checkboxClass(payload)

      return withClassPicker({ ...slots, all: CHECKBOX_CLASS_COMPOSERS.checkboxClass(slots, payload) } as const)
    },

    labelClass(payload: Parameters<typeof CHECKBOX_CLASS_SLOTS.labelClass>[0]) {
      const slots = CHECKBOX_CLASS_SLOTS.labelClass(payload)

      return withClassPicker({ ...slots, all: CHECKBOX_CLASS_COMPOSERS.labelClass(slots, payload) } as const)
    },

    focusHelperClass() {
      const slots = CHECKBOX_CLASS_SLOTS.focusHelperClass()

      return withClassPicker({ ...slots, all: CHECKBOX_CLASS_COMPOSERS.focusHelperClass(slots) } as const)
    },
  },
}

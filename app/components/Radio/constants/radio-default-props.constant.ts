import { RADIO_CLASS_COMPOSERS, RADIO_CLASS_SLOTS } from './radio-class-slots.constant'

// @unocss-include

export const RADIO_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof RADIO_CLASS_SLOTS.containerClass>[0]) {
      const slots = RADIO_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: RADIO_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    radioClass(payload: Parameters<typeof RADIO_CLASS_SLOTS.radioClass>[0]) {
      const slots = RADIO_CLASS_SLOTS.radioClass(payload)

      return withClassPicker({ ...slots, all: RADIO_CLASS_COMPOSERS.radioClass(slots, payload) } as const)
    },

    labelClass(payload: Parameters<typeof RADIO_CLASS_SLOTS.labelClass>[0]) {
      const slots = RADIO_CLASS_SLOTS.labelClass(payload)

      return withClassPicker({ ...slots, all: RADIO_CLASS_COMPOSERS.labelClass(slots, payload) } as const)
    },

    focusHelperClass() {
      const slots = RADIO_CLASS_SLOTS.focusHelperClass()

      return withClassPicker({ ...slots, all: RADIO_CLASS_COMPOSERS.focusHelperClass(slots) } as const)
    },
  },
}

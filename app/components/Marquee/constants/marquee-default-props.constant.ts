import { MARQUEE_CLASS_COMPOSERS, MARQUEE_CLASS_SLOTS } from './marquee-class-slots.constant'

// @unocss-include

export const MARQUEE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = MARQUEE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: MARQUEE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass(payload: Parameters<typeof MARQUEE_CLASS_SLOTS.contentClass>[0]) {
      const slots = MARQUEE_CLASS_SLOTS.contentClass(payload)

      return withClassPicker({ ...slots, all: MARQUEE_CLASS_COMPOSERS.contentClass(slots, payload) } as const)
    },
  },
}

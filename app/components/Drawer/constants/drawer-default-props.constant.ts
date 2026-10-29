import { DRAWER_CLASS_COMPOSERS, DRAWER_CLASS_SLOTS } from './drawer-class-slots.constant'

// @unocss-include

export const DRAWER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = DRAWER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: DRAWER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    titleClass() {
      const slots = DRAWER_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: DRAWER_CLASS_COMPOSERS.titleClass(slots) } as const)
    },
  },
}

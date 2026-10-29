import { SCROLL_AREA_CLASS_COMPOSERS, SCROLL_AREA_CLASS_SLOTS } from './scroll-area-class-slots.constant'

// @unocss-include

export const SCROLL_AREA_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = SCROLL_AREA_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: SCROLL_AREA_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
}

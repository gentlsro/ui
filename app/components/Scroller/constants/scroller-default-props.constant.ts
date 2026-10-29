import { SCROLLER_CLASS_COMPOSERS, SCROLLER_CLASS_SLOTS } from './scroller-class-slots.constant'

// @unocss-include

export const SCROLLER_DEFAULT_PROPS = {
  ui: {
    // Horizontal scroller container
    horizontalContainerClass() {
      const slots = SCROLLER_CLASS_SLOTS.horizontalContainerClass()

      return withClassPicker({ ...slots, all: SCROLLER_CLASS_COMPOSERS.horizontalContainerClass(slots) } as const)
    },

    // Vertical scroller container
    verticalContainerClass() {
      const slots = SCROLLER_CLASS_SLOTS.verticalContainerClass()

      return withClassPicker({ ...slots, all: SCROLLER_CLASS_COMPOSERS.verticalContainerClass(slots) } as const)
    },

    contentClass() {
      const slots = SCROLLER_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: SCROLLER_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    verticalContentClass() {
      const slots = SCROLLER_CLASS_SLOTS.verticalContentClass()

      return withClassPicker({ ...slots, all: SCROLLER_CLASS_COMPOSERS.verticalContentClass(slots) } as const)
    },

    arrowClass() {
      const slots = SCROLLER_CLASS_SLOTS.arrowClass()

      return withClassPicker({ ...slots, all: SCROLLER_CLASS_COMPOSERS.arrowClass(slots) } as const)
    },
  },
}

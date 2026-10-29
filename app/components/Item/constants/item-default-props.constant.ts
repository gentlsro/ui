import { ITEM_CLASS_COMPOSERS, ITEM_CLASS_SLOTS } from './item-class-slots.constant'

// @unocss-include

export const ITEM_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = ITEM_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: ITEM_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    focusHelperClass() {
      const slots = ITEM_CLASS_SLOTS.focusHelperClass()

      return withClassPicker({ ...slots, all: ITEM_CLASS_COMPOSERS.focusHelperClass(slots) } as const)
    },
  },
}

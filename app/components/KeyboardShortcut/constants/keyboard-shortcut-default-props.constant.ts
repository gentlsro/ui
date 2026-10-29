import { KEYBOARD_SHORTCUT_CLASS_COMPOSERS, KEYBOARD_SHORTCUT_CLASS_SLOTS } from './keyboard-shortcut-class-slots.constant'

// @unocss-include

export const KEYBOARD_SHORTCUT_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = KEYBOARD_SHORTCUT_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: KEYBOARD_SHORTCUT_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    wrapperClass() {
      const slots = KEYBOARD_SHORTCUT_CLASS_SLOTS.wrapperClass()

      return withClassPicker({ ...slots, all: KEYBOARD_SHORTCUT_CLASS_COMPOSERS.wrapperClass(slots) } as const)
    },

    iconClass() {
      const slots = KEYBOARD_SHORTCUT_CLASS_SLOTS.iconClass()

      return withClassPicker({ ...slots, all: KEYBOARD_SHORTCUT_CLASS_COMPOSERS.iconClass(slots) } as const)
    },
  },
}

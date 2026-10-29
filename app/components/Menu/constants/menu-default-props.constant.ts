// @unocss-include

// Types
import type { IMenuProps } from '../types/menu-props.type'
import { MENU_CLASS_COMPOSERS, MENU_CLASS_SLOTS } from './menu-class-slots.constant'

export const MENU_DEFAULT_PROPS = {
  ui: {
    menuClass() {
      const slots = MENU_CLASS_SLOTS.menuClass()

      return withClassPicker({ ...slots, all: MENU_CLASS_COMPOSERS.menuClass(slots) } as const)
    },

    contentClass() {
      const slots = MENU_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: MENU_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    headerClass() {
      const slots = MENU_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: MENU_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    titleClass() {
      const slots = MENU_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: MENU_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    overlayClass() {
      const slots = MENU_CLASS_SLOTS.overlayClass()

      return withClassPicker({ ...slots, all: MENU_CLASS_COMPOSERS.overlayClass(slots) } as const)
    },
  },
} satisfies IMenuProps

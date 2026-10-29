import { CRUD_BTNS_CLASS_COMPOSERS, CRUD_BTNS_CLASS_SLOTS, CRUD_EDIT_BTN_CLASS_COMPOSERS, CRUD_EDIT_BTN_CLASS_SLOTS } from './crud-btns-class-slots.constant'

// @unocss-include

export const CRUD_BTNS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = CRUD_BTNS_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: CRUD_BTNS_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
}

export const CRUD_EDIT_BTN_DEFAULT_PROPS = {
  ui: {
    wrapperClass() {
      const slots = CRUD_EDIT_BTN_CLASS_SLOTS.wrapperClass()

      return withClassPicker({ ...slots, all: CRUD_EDIT_BTN_CLASS_COMPOSERS.wrapperClass(slots) } as const)
    },

    btnClass() {
      const slots = CRUD_EDIT_BTN_CLASS_SLOTS.btnClass()

      return withClassPicker({ ...slots, all: CRUD_EDIT_BTN_CLASS_COMPOSERS.btnClass(slots) } as const)
    },
  },
}

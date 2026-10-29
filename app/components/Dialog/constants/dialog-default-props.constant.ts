// @unocss-include

// Types
import type { DialogPosition, IDialogProps } from '../types/dialog-props.type'
import { DIALOG_CLASS_COMPOSERS, DIALOG_CLASS_SLOTS } from './dialog-class-slots.constant'

export const DIALOG_DEFAULT_PROPS = {
  ui: {
    backdropClass() {
      const slots = DIALOG_CLASS_SLOTS.backdropClass()

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.backdropClass(slots) } as const)
    },

    wrapperClass() {
      const slots = DIALOG_CLASS_SLOTS.wrapperClass()

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.wrapperClass(slots) } as const)
    },

    dialogClass(payload: Parameters<typeof DIALOG_CLASS_SLOTS.dialogClass>[0]) {
      const slots = DIALOG_CLASS_SLOTS.dialogClass(payload)

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.dialogClass(slots, payload) } as const)
    },

    headerClass() {
      const slots = DIALOG_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    titleClass() {
      const slots = DIALOG_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    contentClass() {
      const slots = DIALOG_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: DIALOG_CLASS_COMPOSERS.contentClass(slots) } as const)
    },
  },
}

// @unocss-include

// Types
import type { IFormProps } from '../types/form-props.type'
import { FORM_CLASS_COMPOSERS, FORM_CLASS_SLOTS } from './form-class-slots.constant'

export const FORM_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = FORM_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = FORM_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    controlsClass() {
      const slots = FORM_CLASS_SLOTS.controlsClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.controlsClass(slots) } as const)
    },

    submitWrapperClass() {
      const slots = FORM_CLASS_SLOTS.submitWrapperClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.submitWrapperClass(slots) } as const)
    },

    submitClass() {
      const slots = FORM_CLASS_SLOTS.submitClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.submitClass(slots) } as const)
    },

    cancelClass() {
      const slots = FORM_CLASS_SLOTS.cancelClass()

      return withClassPicker({ ...slots, all: FORM_CLASS_COMPOSERS.cancelClass(slots) } as const)
    },
  },
} satisfies IFormProps

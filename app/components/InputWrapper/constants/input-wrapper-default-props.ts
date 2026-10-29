// @unocss-include

// Types
import type { IInputWrapperProps } from '../types/input-wrapper-props.type'
import { INPUT_WRAPPER_CLASS_COMPOSERS, INPUT_WRAPPER_CLASS_SLOTS } from './input-wrapper-class-slots.constant'

export const INPUT_WRAPPER_DEFAULT_PROPS = {
  ui: {
    wrapperClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.wrapperClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.wrapperClass(slots) } as const)
    },
    appendClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.appendClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.appendClass(slots) } as const)
    },

    contentClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    errorClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.errorClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.errorClass(slots) } as const)
    },

    hintClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.hintClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.hintClass(slots) } as const)
    },

    inputContainerClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.inputContainerClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.inputContainerClass(slots) } as const)
    },

    inputInnerContainerClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.inputInnerContainerClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.inputInnerContainerClass(slots) } as const)
    },

    inputClass() {
      const slots = INPUT_WRAPPER_CLASS_SLOTS.inputClass()

      return withClassPicker({ ...slots, all: INPUT_WRAPPER_CLASS_COMPOSERS.inputClass(slots) } as const)
    },
  },
} satisfies IInputWrapperProps

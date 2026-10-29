// @unocss-include

// Types
import type { IInputLabelProps } from '../types/input-label-props.type'
import { INPUT_LABEL_CLASS_COMPOSERS, INPUT_LABEL_CLASS_SLOTS } from './input-label-class-slots.constant'

export const INPUT_LABEL_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const slots = INPUT_LABEL_CLASS_SLOTS.labelClass()

      return withClassPicker({ ...slots, all: INPUT_LABEL_CLASS_COMPOSERS.labelClass(slots) } as const)
    },
  },
} satisfies IInputLabelProps

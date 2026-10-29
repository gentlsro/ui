// @unocss-include
import type { IChipProps } from '../types/chip-props.type'
import { CHIP_CLASS_COMPOSERS, CHIP_CLASS_SLOTS } from './chip-class-slots.constant'

export const CHIP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = CHIP_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: CHIP_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    labelClass() {
      const slots = CHIP_CLASS_SLOTS.labelClass()

      return withClassPicker({ ...slots, all: CHIP_CLASS_COMPOSERS.labelClass(slots) } as const)
    },
  },
} satisfies IChipProps

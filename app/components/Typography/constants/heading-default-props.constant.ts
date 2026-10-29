// @unocss-include

// Types
import type { IHeadingProps } from '../types/heading-props.type'
import { HEADING_CLASS_COMPOSERS, HEADING_CLASS_SLOTS } from './heading-class-slots.constant'

export const HEADING_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = HEADING_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: HEADING_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
} satisfies IHeadingProps

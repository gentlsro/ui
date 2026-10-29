// @unocss-include

// Types
import type { IBadgeProps } from '../types/badge-props.type'
import { BADGE_CLASS_COMPOSERS, BADGE_CLASS_SLOTS } from './badge-class-slots.constant'

export const BADGE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = BADGE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: BADGE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
} satisfies IBadgeProps

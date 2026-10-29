// @unocss-include

// Types
import type { IMiniCardProps } from '../types/mini-card-props.type'
import { MINI_CARD_CLASS_COMPOSERS, MINI_CARD_CLASS_SLOTS } from './mini-card-class-slots.constant'

export const MINI_CARD_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = MINI_CARD_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    iconContainerClass() {
      const slots = MINI_CARD_CLASS_SLOTS.iconContainerClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.iconContainerClass(slots) } as const)
    },

    iconClass() {
      const slots = MINI_CARD_CLASS_SLOTS.iconClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.iconClass(slots) } as const)
    },

    contentClass() {
      const slots = MINI_CARD_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    labelClass() {
      const slots = MINI_CARD_CLASS_SLOTS.labelClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.labelClass(slots) } as const)
    },

    valueClass() {
      const slots = MINI_CARD_CLASS_SLOTS.valueClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.valueClass(slots) } as const)
    },

    previousValueClass() {
      const slots = MINI_CARD_CLASS_SLOTS.previousValueClass()

      return withClassPicker({ ...slots, all: MINI_CARD_CLASS_COMPOSERS.previousValueClass(slots) } as const)
    },
  },
}

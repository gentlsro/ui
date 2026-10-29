// @unocss-include

// Types
import type { ITooltipProps } from '../types/tooltip-props.type'
import { TOOLTIP_CLASS_COMPOSERS, TOOLTIP_CLASS_SLOTS } from './tooltip-class-slots.constant'

export const TOOLTIP_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = TOOLTIP_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: TOOLTIP_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = TOOLTIP_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: TOOLTIP_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    titleClass() {
      const slots = TOOLTIP_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: TOOLTIP_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    descriptionClass() {
      const slots = TOOLTIP_CLASS_SLOTS.descriptionClass()

      return withClassPicker({ ...slots, all: TOOLTIP_CLASS_COMPOSERS.descriptionClass(slots) } as const)
    },

    arrowClass() {
      const slots = TOOLTIP_CLASS_SLOTS.arrowClass()

      return withClassPicker({ ...slots, all: TOOLTIP_CLASS_COMPOSERS.arrowClass(slots) } as const)
    },
  },
} satisfies ITooltipProps

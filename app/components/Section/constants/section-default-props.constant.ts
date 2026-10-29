// @unocss-include

// Types
import type { ISectionProps } from '../types/section-props.type'
import { SECTION_CLASS_COMPOSERS, SECTION_CLASS_SLOTS } from './section-class-slots.constant'

export const SECTION_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = SECTION_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: SECTION_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    titleClass() {
      const slots = SECTION_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: SECTION_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    subtitleClass() {
      const slots = SECTION_CLASS_SLOTS.subtitleClass()

      return withClassPicker({ ...slots, all: SECTION_CLASS_COMPOSERS.subtitleClass(slots) } as const)
    },

    contentClass() {
      const slots = SECTION_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: SECTION_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    loadingClass() {
      const slots = SECTION_CLASS_SLOTS.loadingClass()

      return withClassPicker({ ...slots, all: SECTION_CLASS_COMPOSERS.loadingClass(slots) } as const)
    },
  },
} satisfies ISectionProps

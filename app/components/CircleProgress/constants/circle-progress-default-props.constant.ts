import { CIRCLE_PROGRESS_CLASS_COMPOSERS, CIRCLE_PROGRESS_CLASS_SLOTS } from './circle-progress-class-slots.constant'

// @unocss-include

export const CIRCLE_PROGRESS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = CIRCLE_PROGRESS_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: CIRCLE_PROGRESS_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    svgClass() {
      const slots = CIRCLE_PROGRESS_CLASS_SLOTS.svgClass()

      return withClassPicker({ ...slots, all: CIRCLE_PROGRESS_CLASS_COMPOSERS.svgClass(slots) } as const)
    },

    circleBgClass() {
      const slots = CIRCLE_PROGRESS_CLASS_SLOTS.circleBgClass()

      return withClassPicker({ ...slots, all: CIRCLE_PROGRESS_CLASS_COMPOSERS.circleBgClass(slots) } as const)
    },

    circleClass() {
      const slots = CIRCLE_PROGRESS_CLASS_SLOTS.circleClass()

      return withClassPicker({ ...slots, all: CIRCLE_PROGRESS_CLASS_COMPOSERS.circleClass(slots) } as const)
    },

    textClass() {
      const slots = CIRCLE_PROGRESS_CLASS_SLOTS.textClass()

      return withClassPicker({ ...slots, all: CIRCLE_PROGRESS_CLASS_COMPOSERS.textClass(slots) } as const)
    },
  },
}

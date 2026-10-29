import { PROGRESS_BAR_CLASS_COMPOSERS, PROGRESS_BAR_CLASS_SLOTS } from './progress-bar-class-slots.constant'

// @unocss-include

export const PROGRESS_BAR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    innerClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.innerClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.innerClass(slots) } as const)
    },

    colorClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.colorClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.colorClass(slots) } as const)
    },

    whiteBgClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.whiteBgClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.whiteBgClass(slots) } as const)
    },

    blackBgClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.blackBgClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.blackBgClass(slots) } as const)
    },

    textClass() {
      const slots = PROGRESS_BAR_CLASS_SLOTS.textClass()

      return withClassPicker({ ...slots, all: PROGRESS_BAR_CLASS_COMPOSERS.textClass(slots) } as const)
    },
  },
}

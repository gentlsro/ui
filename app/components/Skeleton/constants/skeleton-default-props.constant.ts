import { SKELETON_CLASS_COMPOSERS, SKELETON_CLASS_SLOTS } from './skeleton-class-slots.constant'

// @unocss-include

export const SKELETON_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof SKELETON_CLASS_SLOTS.containerClass>[0]) {
      const slots = SKELETON_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: SKELETON_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },
  },
}

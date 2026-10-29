import { NOTIFICATIONS_CLASS_COMPOSERS, NOTIFICATIONS_CLASS_SLOTS } from './notifications-class-slots.constant'

// @unocss-include

export const NOTIFICATIONS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = NOTIFICATIONS_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: NOTIFICATIONS_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
}

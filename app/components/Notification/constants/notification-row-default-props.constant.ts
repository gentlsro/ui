import { NOTIFICATION_ROW_CLASS_COMPOSERS, NOTIFICATION_ROW_CLASS_SLOTS } from './notification-row-class-slots.constant'

// @unocss-include

export const NOTIFICATION_ROW_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    titleRowClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.titleRowClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.titleRowClass(slots) } as const)
    },

    iconClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.iconClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.iconClass(slots) } as const)
    },

    titleClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    titleTextClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.titleTextClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.titleTextClass(slots) } as const)
    },

    subtitleClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.subtitleClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.subtitleClass(slots) } as const)
    },

    subtitleItemClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.subtitleItemClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.subtitleItemClass(slots) } as const)
    },

    counterClass() {
      const slots = NOTIFICATION_ROW_CLASS_SLOTS.counterClass()

      return withClassPicker({ ...slots, all: NOTIFICATION_ROW_CLASS_COMPOSERS.counterClass(slots) } as const)
    },
  },
}

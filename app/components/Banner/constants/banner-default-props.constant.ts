import { BANNER_CLASS_COMPOSERS, BANNER_CLASS_SLOTS } from './banner-class-slots.constant'

// @unocss-include

export const BANNER_DEFAULT_PROPS = {
  ui: {
    badgeClass(payload: Parameters<typeof BANNER_CLASS_SLOTS.badgeClass>[0]) {
      const slots = BANNER_CLASS_SLOTS.badgeClass(payload)

      return withClassPicker({ ...slots, all: BANNER_CLASS_COMPOSERS.badgeClass(slots, payload) } as const)
    },

    containerClass(payload: Parameters<typeof BANNER_CLASS_SLOTS.containerClass>[0]) {
      const slots = BANNER_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: BANNER_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    iconClass(payload: Parameters<typeof BANNER_CLASS_SLOTS.iconClass>[0]) {
      const slots = BANNER_CLASS_SLOTS.iconClass(payload)

      return withClassPicker({ ...slots, all: BANNER_CLASS_COMPOSERS.iconClass(slots, payload) } as const)
    },

    labelClass() {
      const slots = BANNER_CLASS_SLOTS.labelClass()

      return withClassPicker({ ...slots, all: BANNER_CLASS_COMPOSERS.labelClass(slots) } as const)
    },

    dismissClass() {
      const slots = BANNER_CLASS_SLOTS.dismissClass()

      return withClassPicker({ ...slots, all: BANNER_CLASS_COMPOSERS.dismissClass(slots) } as const)
    },
  },
}

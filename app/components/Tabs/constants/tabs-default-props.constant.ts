import { TABS_CLASS_COMPOSERS, TABS_CLASS_SLOTS } from './tabs-class-slots.constant'

// @unocss-include

export const TABS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = TABS_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: TABS_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    navigationClass() {
      const slots = TABS_CLASS_SLOTS.navigationClass()

      return withClassPicker({ ...slots, all: TABS_CLASS_COMPOSERS.navigationClass(slots) } as const)
    },

    navigationContentClass() {
      const slots = TABS_CLASS_SLOTS.navigationContentClass()

      return withClassPicker({ ...slots, all: TABS_CLASS_COMPOSERS.navigationContentClass(slots) } as const)
    },

    tabClass() {
      const slots = TABS_CLASS_SLOTS.tabClass()

      return withClassPicker({ ...slots, all: TABS_CLASS_COMPOSERS.tabClass(slots) } as const)
    },

    tabNavBtnClass() {
      const slots = TABS_CLASS_SLOTS.tabNavBtnClass()

      return withClassPicker({ ...slots, all: TABS_CLASS_COMPOSERS.tabNavBtnClass(slots) } as const)
    },
  },
}

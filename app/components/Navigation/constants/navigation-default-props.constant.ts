// @unocss-include

// Types
import type { INavigationProps } from '../types/navigation-props.type'
import { NAVIGATION_CLASS_COMPOSERS, NAVIGATION_CLASS_SLOTS } from './navigation-class-slots.constant'

export const NAVIGATION_DEFAULT_PROPS = {
  ui: {
    headerClass() {
      const slots = NAVIGATION_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: NAVIGATION_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    navigationClass() {
      const slots = NAVIGATION_CLASS_SLOTS.navigationClass()

      return withClassPicker({ ...slots, all: NAVIGATION_CLASS_COMPOSERS.navigationClass(slots) } as const)
    },
  },
} satisfies INavigationProps

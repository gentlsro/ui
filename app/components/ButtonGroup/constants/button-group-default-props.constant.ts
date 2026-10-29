// @unocss-include

// Types
import type { IButtonGroupProps } from '../types/button-group-props.type'
import { BUTTON_GROUP_CLASS_COMPOSERS, BUTTON_GROUP_CLASS_SLOTS } from './button-group-class-slots.constant'

export const BUTTON_GROUP_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof BUTTON_GROUP_CLASS_SLOTS.containerClass>[0] = {}) {
      const slots = BUTTON_GROUP_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: BUTTON_GROUP_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    buttonClass(payload: Parameters<typeof BUTTON_GROUP_CLASS_SLOTS.buttonClass>[0] = {}) {
      const slots = BUTTON_GROUP_CLASS_SLOTS.buttonClass(payload)

      return withClassPicker({ ...slots, all: BUTTON_GROUP_CLASS_COMPOSERS.buttonClass(slots, payload) } as const)
    },

    activeClass(payload: Parameters<typeof BUTTON_GROUP_CLASS_SLOTS.activeClass>[0] = {}) {
      const slots = BUTTON_GROUP_CLASS_SLOTS.activeClass(payload)

      return withClassPicker({ ...slots, all: BUTTON_GROUP_CLASS_COMPOSERS.activeClass(slots, payload) } as const)
    },
  },
}

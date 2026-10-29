// @unocss-include

// Types
import { MENU_DEFAULT_PROPS } from '../../Menu/constants/menu-default-props.constant'
import type { IMenuConfirmationProps } from '../types/menu-confirmation-props.type'
import { MENU_CONFIRMATION_CLASS_COMPOSERS, MENU_CONFIRMATION_CLASS_SLOTS } from './menu-confirmation-class-slots.constant'

export const MENU_CONFIRMATION_DEFAULT_PROPS = {
  ui: {
    confirmBtnClass() {
      const slots = MENU_CONFIRMATION_CLASS_SLOTS.confirmBtnClass()

      return withClassPicker({ ...slots, all: MENU_CONFIRMATION_CLASS_COMPOSERS.confirmBtnClass(slots) } as const)
    },

    confirmationTextClass() {
      const slots = MENU_CONFIRMATION_CLASS_SLOTS.confirmationTextClass()

      return withClassPicker({ ...slots, all: MENU_CONFIRMATION_CLASS_COMPOSERS.confirmationTextClass(slots) } as const)
    },
  },
} satisfies IMenuConfirmationProps

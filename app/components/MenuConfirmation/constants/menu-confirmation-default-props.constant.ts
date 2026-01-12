// @unocss-include

// Types
import { MENU_DEFAULT_PROPS } from '../../Menu/constants/menu-default-props.constant'
import type { IMenuConfirmationProps } from '../types/menu-confirmation-props.type'

export const MENU_CONFIRMATION_DEFAULT_PROPS = {
  ui: {
    confirmBtnClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IMenuConfirmationProps

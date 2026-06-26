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

    confirmationTextClass() {
      const base = 'color-ca font-rem-14 text-center p-x-4 p-y-2'

      return {
        base,
        all: base,
      } as const
    },
  },
} satisfies IMenuConfirmationProps

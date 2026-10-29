// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const MENU_CONFIRMATION_CLASS_SLOTS = {
  confirmBtnClass() {
    const base = ''

    return {
      base,
    } as const
  },

  confirmationTextClass() {
    const base = 'color-ca font-rem-14 text-center p-x-4 p-y-2'

    return {
      base,
    } as const
  },
}

type MenuConfirmationSlots<K extends keyof typeof MENU_CONFIRMATION_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MENU_CONFIRMATION_CLASS_SLOTS[K]>>

export const MENU_CONFIRMATION_CLASS_COMPOSERS = {
  confirmBtnClass(slots: MenuConfirmationSlots<'confirmBtnClass'>) {
    return `${slots.base}`
  },

  confirmationTextClass(slots: MenuConfirmationSlots<'confirmationTextClass'>) {
    return slots.base
  },
}

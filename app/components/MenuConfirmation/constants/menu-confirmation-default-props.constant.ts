// @unocss-include

import { MENU_DEFAULT_PROPS } from '../../Menu/constants/menu-default-props.constant'
import type { IMenuConfirmationProps } from '../types/menu-confirmation-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

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

export const MENU_CONFIRMATION_DEFAULT_PROPS = {
  ui: createUIClassResolver('menuConfirmation', {
    slots: MENU_CONFIRMATION_CLASS_SLOTS,
    compose: MENU_CONFIRMATION_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies IMenuConfirmationProps

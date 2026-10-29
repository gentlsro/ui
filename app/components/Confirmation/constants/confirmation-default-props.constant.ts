// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const CONFIRMATION_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col inset-0 absolute bg-white dark:bg-dark-950 rounded-custom z-$zMax'

    return {
      base,
    } as const
  },

  checkmarkClass() {
    const base = 'flex flex-col flex-center grow'

    return {
      base,
    } as const
  },

  textClass() {
    const base = 'font-rem-14 text-center p-x-4'

    return {
      base,
    } as const
  },

  actionsClass() {
    const base = 'flex items-center p-x-3 p-y-1 shrink-0 justify-end gap-x-3'

    return {
      base,
    } as const
  },
}

type ConfirmationSlots<K extends keyof typeof CONFIRMATION_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CONFIRMATION_CLASS_SLOTS[K]>>

export const CONFIRMATION_CLASS_COMPOSERS = {
  containerClass(slots: ConfirmationSlots<'containerClass'>) {
    return slots.base
  },

  checkmarkClass(slots: ConfirmationSlots<'checkmarkClass'>) {
    return slots.base
  },

  textClass(slots: ConfirmationSlots<'textClass'>) {
    return slots.base
  },

  actionsClass(slots: ConfirmationSlots<'actionsClass'>) {
    return slots.base
  },
}

export const CONFIRMATION_DEFAULT_PROPS = {
  ui: createUIClassResolver('confirmation', {
    slots: CONFIRMATION_CLASS_SLOTS,
    compose: CONFIRMATION_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

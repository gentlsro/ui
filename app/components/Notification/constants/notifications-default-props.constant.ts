// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const NOTIFICATIONS_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col gap-y-1 transition-transform fixed z-$zMax min-w-240px max-w-320px lt-xm:max-w-280px flex-center'

    return {
      base,
    } as const
  },
}

type NotificationsSlots<K extends keyof typeof NOTIFICATIONS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof NOTIFICATIONS_CLASS_SLOTS[K]>>

export const NOTIFICATIONS_CLASS_COMPOSERS = {
  containerClass(slots: NotificationsSlots<'containerClass'>) {
    return slots.base
  },
}

export const NOTIFICATIONS_DEFAULT_PROPS = {
  ui: createUIClassResolver('notifications', {
    slots: NOTIFICATIONS_CLASS_SLOTS,
    compose: NOTIFICATIONS_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

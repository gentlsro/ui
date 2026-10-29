// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const TABS_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col'

    return {
      base,
    } as const
  },

  navigationClass() {
    const base = 'shrink-0'

    return {
      base,
    } as const
  },

  navigationContentClass() {
    const base = 'flex gap-1'

    return {
      base,
    } as const
  },

  tabClass() {
    const base = 'fit rounded-b-custom'

    return {
      base,
    } as const
  },

  tabNavBtnClass() {
    const base = ''

    // State styling via CSS selectors
    const active = '[&.is-active]:(bg-primary color-white)'
    const inactive = '[&:not(.is-active)]:(color-ca)'

    return {
      base,
      active,
      inactive,
    } as const
  },
}

type TabsSlots<K extends keyof typeof TABS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof TABS_CLASS_SLOTS[K]>>

export const TABS_CLASS_COMPOSERS = {
  containerClass(slots: TabsSlots<'containerClass'>) {
    return slots.base
  },

  navigationClass(slots: TabsSlots<'navigationClass'>) {
    return slots.base
  },

  navigationContentClass(slots: TabsSlots<'navigationContentClass'>) {
    return slots.base
  },

  tabClass(slots: TabsSlots<'tabClass'>) {
    return slots.base
  },

  tabNavBtnClass(slots: TabsSlots<'tabNavBtnClass'>) {
    return `${slots.base} ${slots.active} ${slots.inactive}`
  },
}

export const TABS_DEFAULT_PROPS = {
  ui: createUIClassResolver('tabs', {
    slots: TABS_CLASS_SLOTS,
    compose: TABS_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

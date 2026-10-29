// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const ITEM_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex relative rounded-custom items-center cursor-pointer gap-x-1'

    // States (via CSS selectors)
    const readonly = '[&.is-readonly]:(cursor-default)'
    const disabled = '[&.is-disabled]:(cursor-not-allowed opacity-50)'

    return {
      base,
      readonly,
      disabled,
    } as const
  },

  focusHelperClass() {
    const base = 'absolute fit z-3 rounded-inherit inset-0 pointer-events-none'

    // Hover effect (via CSS group selector - container must have item class)
    const hover = '[.item:hover_&]:(bg-current opacity-10)'

    return {
      base,
      hover,
    } as const
  },
}

type ItemSlots<K extends keyof typeof ITEM_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof ITEM_CLASS_SLOTS[K]>>

export const ITEM_CLASS_COMPOSERS = {
  containerClass(slots: ItemSlots<'containerClass'>) {
    return `${slots.base} ${slots.readonly} ${slots.disabled}`
  },

  focusHelperClass(slots: ItemSlots<'focusHelperClass'>) {
    return `${slots.base} ${slots.hover}`
  },
}

export const ITEM_DEFAULT_PROPS = {
  ui: createUIClassResolver('item', {
    slots: ITEM_CLASS_SLOTS,
    compose: ITEM_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

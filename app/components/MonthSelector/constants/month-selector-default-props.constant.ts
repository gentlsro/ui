// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const MONTH_SELECTOR_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex gap-x-1 items-center'

    return {
      base,
    } as const
  },

  previousBtnClass() {
    const base = 'w-8 h-8 p-3 lt-xs:hidden'

    return {
      base,
    } as const
  },

  currentBtnClass() {
    const base = 'flex-1 h-8 self-center capitalize'

    return {
      base,
    } as const
  },

  nextBtnClass() {
    const base = 'w-8 h-8 p-3 lt-xs:hidden'

    return {
      base,
    } as const
  },

  gridContainerClass() {
    const base = 'grid grid-cols-2 xm:grid-cols-3 gap-1'

    return {
      base,
    } as const
  },

  monthBtnClass() {
    const base = 'capitalize'

    // States (via CSS selectors)
    const selected = '[&.is-selected]:(bg-primary color-white)'
    const current = '[&.is-current]:(border-2 border-ca)'

    return {
      base,
      selected,
      current,
    } as const
  },
}

type MonthSelectorSlots<K extends keyof typeof MONTH_SELECTOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MONTH_SELECTOR_CLASS_SLOTS[K]>>

export const MONTH_SELECTOR_CLASS_COMPOSERS = {
  containerClass(slots: MonthSelectorSlots<'containerClass'>) {
    return slots.base
  },

  previousBtnClass(slots: MonthSelectorSlots<'previousBtnClass'>) {
    return slots.base
  },

  currentBtnClass(slots: MonthSelectorSlots<'currentBtnClass'>) {
    return slots.base
  },

  nextBtnClass(slots: MonthSelectorSlots<'nextBtnClass'>) {
    return slots.base
  },

  gridContainerClass(slots: MonthSelectorSlots<'gridContainerClass'>) {
    return slots.base
  },

  monthBtnClass(slots: MonthSelectorSlots<'monthBtnClass'>) {
    return `${slots.base} ${slots.selected} ${slots.current}`
  },
}

export const MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: createUIClassResolver('monthSelector', {
    slots: MONTH_SELECTOR_CLASS_SLOTS,
    compose: MONTH_SELECTOR_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

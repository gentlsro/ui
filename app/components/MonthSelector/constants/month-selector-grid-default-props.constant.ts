// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const MONTH_SELECTOR_GRID_CLASS_SLOTS = {
  containerClass() {
    const base = 'grid grid-cols-2 xm:grid-cols-3 gap-1'

    return {
      base,
    } as const
  },

  monthBtnClass() {
    const base = 'capitalize'

    // States (via CSS selectors)
    const selected = '[&.is-selected]:(bg-primary color-white)'
    const current = '[&.is-current]:(shadow-coolGray shadow-[0px_0px_0px_2px_var(--un-shadow-color)])'

    return {
      base,
      selected,
      current,
    } as const
  },
}

type MonthSelectorGridSlots<K extends keyof typeof MONTH_SELECTOR_GRID_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MONTH_SELECTOR_GRID_CLASS_SLOTS[K]>>

export const MONTH_SELECTOR_GRID_CLASS_COMPOSERS = {
  containerClass(slots: MonthSelectorGridSlots<'containerClass'>) {
    return slots.base
  },

  monthBtnClass(slots: MonthSelectorGridSlots<'monthBtnClass'>) {
    return `${slots.base} ${slots.selected} ${slots.current}`
  },
}

export const MONTH_SELECTOR_GRID_DEFAULT_PROPS = {
  ui: createUIClassResolver('monthSelectorGrid', {
    slots: MONTH_SELECTOR_GRID_CLASS_SLOTS,
    compose: MONTH_SELECTOR_GRID_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

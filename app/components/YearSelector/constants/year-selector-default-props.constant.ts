// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const YEAR_SELECTOR_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex gap-x-1 items-center'

    return {
      base,
    } as const
  },

  previousBtnClass() {
    const base = 'w-8 h-8 p-3 lt-xm:hidden'

    return {
      base,
    } as const
  },

  nextBtnClass() {
    const base = 'w-8 h-8 p-3 lt-xm:hidden'

    return {
      base,
    } as const
  },

  menuContainerClass() {
    const base = 'flex flex-col gap-1 grow'

    return {
      base,
    } as const
  },

  yearBtnClass() {
    // States (via CSS selectors)
    const selected = '[&.is-selected]:(bg-primary color-white)'

    return {
      selected,
    } as const
  },
}

type YearSelectorSlots<K extends keyof typeof YEAR_SELECTOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof YEAR_SELECTOR_CLASS_SLOTS[K]>>

export const YEAR_SELECTOR_CLASS_COMPOSERS = {
  containerClass(slots: YearSelectorSlots<'containerClass'>) {
    return slots.base
  },

  previousBtnClass(slots: YearSelectorSlots<'previousBtnClass'>) {
    return slots.base
  },

  nextBtnClass(slots: YearSelectorSlots<'nextBtnClass'>) {
    return slots.base
  },

  menuContainerClass(slots: YearSelectorSlots<'menuContainerClass'>) {
    return slots.base
  },

  yearBtnClass(slots: YearSelectorSlots<'yearBtnClass'>) {
    return slots.selected
  },
}

export const YEAR_SELECTOR_DEFAULT_PROPS = {
  ui: createUIClassResolver('yearSelector', {
    slots: YEAR_SELECTOR_CLASS_SLOTS,
    compose: YEAR_SELECTOR_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

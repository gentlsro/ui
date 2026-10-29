// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const YEAR_MONTH_SELECTOR_CLASS_SLOTS = {
  pickerIconClass() {
    const base = 'h-5.5 w-5.5 color-ca cursor-default'

    // State-based styling via CSS selectors
    // When parent is editable (not readonly and not disabled), make cursor pointer
    const editable = '[.year-month-selector:not(.is-readonly):not(.is-disabled)_&]:(cursor-pointer)'

    return {
      base,
      editable,
    } as const
  },
}

type YearMonthSelectorSlots<K extends keyof typeof YEAR_MONTH_SELECTOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof YEAR_MONTH_SELECTOR_CLASS_SLOTS[K]>>

export const YEAR_MONTH_SELECTOR_CLASS_COMPOSERS = {
  pickerIconClass(slots: YearMonthSelectorSlots<'pickerIconClass'>) {
    return `${slots.base} ${slots.editable}`
  },
}

export const YEAR_MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: createUIClassResolver('yearMonthSelector', {
    slots: YEAR_MONTH_SELECTOR_CLASS_SLOTS,
    compose: YEAR_MONTH_SELECTOR_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

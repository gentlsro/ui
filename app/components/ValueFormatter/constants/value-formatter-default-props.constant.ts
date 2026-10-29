// @unocss-include

import type { IValueFormatterProps } from '../types/value-formatter-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const VALUE_FORMATTER_CLASS_SLOTS = {
  containerClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type ValueFormatterSlots<K extends keyof typeof VALUE_FORMATTER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof VALUE_FORMATTER_CLASS_SLOTS[K]>>

export const VALUE_FORMATTER_CLASS_COMPOSERS = {
  containerClass(slots: ValueFormatterSlots<'containerClass'>) {
    return `${slots.base}`
  },
}

export const VALUE_FORMATTER_DEFAULT_PROPS = {
  ui: createUIClassResolver('valueFormatter', {
    slots: VALUE_FORMATTER_CLASS_SLOTS,
    compose: VALUE_FORMATTER_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies Partial<IValueFormatterProps>

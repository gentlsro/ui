// @unocss-include

import type { ISelectorProps } from '../types/selector-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const SELECTOR_CLASS_SLOTS = {
  innerClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type SelectorSlots<K extends keyof typeof SELECTOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SELECTOR_CLASS_SLOTS[K]>>

export const SELECTOR_CLASS_COMPOSERS = {
  innerClass(slots: SelectorSlots<'innerClass'>) {
    return `${slots.base}`
  },
}

export const SELECTOR_DEFAULT_PROPS = {
  listProps: {
    ui: {
      contentClass(payload) {
        const { hasSearch } = payload
        const base = hasSearch ? 'p-x-2' : 'p-2'

        return withClassPicker({
          ...payload.defaults,
          base,
        } as const)
      },

      searchClass() {
        const base = 'gap-1 p-2'

        return withClassPicker({
          base,
          all: `${base}`,
        } as const)
      },
    },
  },

  ui: createUIClassResolver('selector', {
    slots: SELECTOR_CLASS_SLOTS,
    compose: SELECTOR_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies ISelectorProps

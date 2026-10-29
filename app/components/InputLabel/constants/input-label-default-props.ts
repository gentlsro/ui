// @unocss-include

import type { IInputLabelProps } from '../types/input-label-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const INPUT_LABEL_CLASS_SLOTS = {
  labelClass() {
    const base = 'color-truegray-600 active:color-blue-500 dark:color-truegray-300 dark:active:color-blue-500'

    /**
     * Applied while the wrapper (= the input) is focused.
     *
     * To customize it, compose on top of `base` instead of `all` with e.g.
     * `group-focus-within/wrapper:(color-red dark:color-blue)`
     */
    const activeColor = 'group-focus-within/wrapper:color-primary'

    return {
      base,
      activeColor,
    } as const
  },
}

type InputLabelSlots<K extends keyof typeof INPUT_LABEL_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof INPUT_LABEL_CLASS_SLOTS[K]>>

export const INPUT_LABEL_CLASS_COMPOSERS = {
  labelClass(slots: InputLabelSlots<'labelClass'>) {
    return `${slots.base} ${slots.activeColor}`
  },
}

export const INPUT_LABEL_DEFAULT_PROPS = {
  ui: createUIClassResolver('inputLabel', {
    slots: INPUT_LABEL_CLASS_SLOTS,
    compose: INPUT_LABEL_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies IInputLabelProps

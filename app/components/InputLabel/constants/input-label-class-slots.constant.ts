// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

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

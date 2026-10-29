// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const KEYBOARD_SHORTCUT_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex gap-1 items-center font-mono color-ca leading-none'

    return {
      base,
    } as const
  },

  wrapperClass() {
    const base = 'flex flex-center border-1 border-ca rounded-1 min-w-4.5 min-h-4.5 bg-white color-darker dark:(bg-darker color-white)'

    return {
      base,
    } as const
  },

  iconClass() {
    const base = 'h-4 w-4'

    return {
      base,
    } as const
  },
}

type KeyboardShortcutSlots<K extends keyof typeof KEYBOARD_SHORTCUT_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof KEYBOARD_SHORTCUT_CLASS_SLOTS[K]>>

export const KEYBOARD_SHORTCUT_CLASS_COMPOSERS = {
  containerClass(slots: KeyboardShortcutSlots<'containerClass'>) {
    return slots.base
  },

  wrapperClass(slots: KeyboardShortcutSlots<'wrapperClass'>) {
    return slots.base
  },

  iconClass(slots: KeyboardShortcutSlots<'iconClass'>) {
    return slots.base
  },
}

export const KEYBOARD_SHORTCUT_DEFAULT_PROPS = {
  ui: createUIClassResolver('keyboardShortcut', {
    slots: KEYBOARD_SHORTCUT_CLASS_SLOTS,
    compose: KEYBOARD_SHORTCUT_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

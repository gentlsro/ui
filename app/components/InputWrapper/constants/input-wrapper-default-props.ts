// @unocss-include

import type { IInputWrapperProps } from '../types/input-wrapper-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const INPUT_WRAPPER_CLASS_SLOTS = {
  wrapperClass() {
    const base = ''

    return {
      base,
    } as const
  },

  appendClass() {
    const base = 'flex gap-1 flex-center p-x-2 shrink-0'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = ''

    return {
      base,
    } as const
  },

  errorClass() {
    const base = 'inline-block p-b-1 transition-height duration-150 color-negative font-rem-12'

    return {
      base,
    } as const
  },

  hintClass() {
    const base = 'color-ca font-rem-12 leading-tight p-y-2px p-x-2 inline-block'

    return {
      base,
    } as const
  },

  inputContainerClass() {
    const base = 'bg-white dark:bg-black'

    return {
      base,
    } as const
  },

  inputInnerContainerClass() {
    const base = ''

    return {
      base,
    } as const
  },

  inputClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type InputWrapperSlots<K extends keyof typeof INPUT_WRAPPER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof INPUT_WRAPPER_CLASS_SLOTS[K]>>

export const INPUT_WRAPPER_CLASS_COMPOSERS = {
  wrapperClass(slots: InputWrapperSlots<'wrapperClass'>) {
    return `${slots.base}`
  },

  appendClass(slots: InputWrapperSlots<'appendClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: InputWrapperSlots<'contentClass'>) {
    return `${slots.base}`
  },

  errorClass(slots: InputWrapperSlots<'errorClass'>) {
    return `${slots.base}`
  },

  hintClass(slots: InputWrapperSlots<'hintClass'>) {
    return `${slots.base}`
  },

  inputContainerClass(slots: InputWrapperSlots<'inputContainerClass'>) {
    return `${slots.base}`
  },

  inputInnerContainerClass(slots: InputWrapperSlots<'inputInnerContainerClass'>) {
    return `${slots.base}`
  },

  inputClass(slots: InputWrapperSlots<'inputClass'>) {
    return `${slots.base}`
  },
}

export const INPUT_WRAPPER_DEFAULT_PROPS = {
  ui: createUIClassResolver('inputWrapper', {
    slots: INPUT_WRAPPER_CLASS_SLOTS,
    compose: INPUT_WRAPPER_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies IInputWrapperProps

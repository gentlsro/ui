// @unocss-include

import type { IFormProps } from '../types/form-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const FORM_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col gap-2 grow overflow-auto'
    const gap = 'gap-2'

    return {
      base,
      gap,
    } as const
  },

  contentClass() {
    const base = 'relative flex flex-col grow overflow-auto'
    const gap = 'gap-2'
    const padding = 'p-2'

    return {
      base,
      gap,
      padding,
    } as const
  },

  controlsClass() {
    const base = 'sticky flex items-center shrink-0 gap-2 bottom-0 z-1 rounded-b-custom'
    const border = 'border-t-1 border-ca [&.is-controls-on-top]:(order-first border-t-0 border-b-1 rounded-b-0 rounded-t-custom)'
    const background = 'bg-white dark:bg-dark-950'
    const padding = 'p-y-1 p-x-2'

    return {
      base,
      border,
      background,
      padding,
    } as const
  },

  submitWrapperClass() {
    const base = 'flex gap-2 relative'

    return {
      base,
      fullWidth: (`${base} grow`) as string,
    } as const
  },

  submitClass() {
    const base = 'bg-primary color-white'

    return {
      base,
      fullWidth: (`${base} grow`) as string,
    } as const
  },

  cancelClass() {
    const base = 'w-auto'

    return {
      base,
    } as const
  },
}

type FormSlots<K extends keyof typeof FORM_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof FORM_CLASS_SLOTS[K]>>

export const FORM_CLASS_COMPOSERS = {
  containerClass(slots: FormSlots<'containerClass'>) {
    return `${slots.base} ${slots.gap}`
  },

  contentClass(slots: FormSlots<'contentClass'>) {
    return `${slots.base} ${slots.gap} ${slots.padding}`
  },

  controlsClass(slots: FormSlots<'controlsClass'>) {
    return `${slots.base} ${slots.border} ${slots.background} ${slots.padding}`
  },

  submitWrapperClass(slots: FormSlots<'submitWrapperClass'>) {
    return `${slots.base} m-l-auto`
  },

  submitClass(slots: FormSlots<'submitClass'>) {
    return `${slots.base} w-40`
  },

  cancelClass(slots: FormSlots<'cancelClass'>) {
    return `${slots.base}`
  },
}

/** Recompute named slots after layer patches without accessor allocation. */
export const FORM_CLASS_DERIVED = {
  submitWrapperClass: {
    fullWidth(slots: FormSlots<'submitWrapperClass'>): string {
      return `${slots.base} grow`
    },
  },
  submitClass: {
    fullWidth(slots: FormSlots<'submitClass'>): string {
      return `${slots.base} grow`
    },
  },
}

export const FORM_DEFAULT_PROPS = {
  ui: createUIClassResolver('form', {
    slots: FORM_CLASS_SLOTS,
    compose: FORM_CLASS_COMPOSERS,
    derive: FORM_CLASS_DERIVED,
  }, () => uiClassLayers),
} satisfies IFormProps

// @unocss-include

import type { ISectionProps } from '../types/section-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const SECTION_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex flex-col'
    const dense = '[&.is-dense]:(!p-0)'

    return {
      base,
      dense,
    } as const
  },

  titleClass() {
    const base = 'relative font-semibold m-b-0 p-b-0.5'

    return {
      base,
    } as const
  },

  subtitleClass() {
    const base = 'font-rem-14 font-400'

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

  loadingClass() {
    const base = 'absolute! inset-0 rounded-custom'

    return {
      base,
    } as const
  },
}

type SectionSlots<K extends keyof typeof SECTION_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SECTION_CLASS_SLOTS[K]>>

export const SECTION_CLASS_COMPOSERS = {
  containerClass(slots: SectionSlots<'containerClass'>) {
    return `${slots.base} ${slots.dense}`
  },

  titleClass(slots: SectionSlots<'titleClass'>) {
    return `${slots.base}`
  },

  subtitleClass(slots: SectionSlots<'subtitleClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: SectionSlots<'contentClass'>) {
    return `${slots.base}`
  },

  loadingClass(slots: SectionSlots<'loadingClass'>) {
    return `${slots.base}`
  },
}

export const SECTION_DEFAULT_PROPS = {
  ui: createUIClassResolver('section', {
    slots: SECTION_CLASS_SLOTS,
    compose: SECTION_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies ISectionProps

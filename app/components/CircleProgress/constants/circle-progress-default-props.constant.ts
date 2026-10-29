// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const CIRCLE_PROGRESS_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex flex-center'

    return {
      base,
    } as const
  },

  svgClass() {
    const base = 'origin-center'

    return {
      base,
    } as const
  },

  circleBgClass() {
    const base = 'stroke-#eee [stroke-linecap:round]'

    return {
      base,
    } as const
  },

  circleClass() {
    const base = '[stroke-linecap:round]'

    return {
      base,
    } as const
  },

  textClass() {
    const base = 'absolute text-lg font-semibold'

    return {
      base,
    } as const
  },
}

type CircleProgressSlots<K extends keyof typeof CIRCLE_PROGRESS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CIRCLE_PROGRESS_CLASS_SLOTS[K]>>

export const CIRCLE_PROGRESS_CLASS_COMPOSERS = {
  containerClass(slots: CircleProgressSlots<'containerClass'>) {
    return `${slots.base}`
  },

  svgClass(slots: CircleProgressSlots<'svgClass'>) {
    return `${slots.base}`
  },

  circleBgClass(slots: CircleProgressSlots<'circleBgClass'>) {
    return `${slots.base}`
  },

  circleClass(slots: CircleProgressSlots<'circleClass'>) {
    return `${slots.base}`
  },

  textClass(slots: CircleProgressSlots<'textClass'>) {
    return `${slots.base}`
  },
}

export const CIRCLE_PROGRESS_DEFAULT_PROPS = {
  ui: createUIClassResolver('circleProgress', {
    slots: CIRCLE_PROGRESS_CLASS_SLOTS,
    compose: CIRCLE_PROGRESS_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

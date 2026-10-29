// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const PROGRESS_BAR_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex relative h-8 rounded-custom'

    return {
      base,
    } as const
  },

  innerClass() {
    const base = 'absolute h-full'

    return {
      base,
    } as const
  },

  colorClass() {
    const base = 'bg-positive mix-blend-screen w-full z-4'

    return {
      base,
    } as const
  },

  whiteBgClass() {
    const base = 'bg-white w-full z-1'

    return {
      base,
    } as const
  },

  blackBgClass() {
    const base = 'bg-black z-2'

    return {
      base,
    } as const
  },

  textClass() {
    const base = 'absolute left-1/2 top-1/2 translate--50% mix-blend-difference color-white z-3 text-nowrap whitespace-nowrap'

    return {
      base,
    } as const
  },
}

type ProgressBarSlots<K extends keyof typeof PROGRESS_BAR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof PROGRESS_BAR_CLASS_SLOTS[K]>>

export const PROGRESS_BAR_CLASS_COMPOSERS = {
  containerClass(slots: ProgressBarSlots<'containerClass'>) {
    return slots.base
  },

  innerClass(slots: ProgressBarSlots<'innerClass'>) {
    return slots.base
  },

  colorClass(slots: ProgressBarSlots<'colorClass'>) {
    return slots.base
  },

  whiteBgClass(slots: ProgressBarSlots<'whiteBgClass'>) {
    return slots.base
  },

  blackBgClass(slots: ProgressBarSlots<'blackBgClass'>) {
    return slots.base
  },

  textClass(slots: ProgressBarSlots<'textClass'>) {
    return slots.base
  },
}

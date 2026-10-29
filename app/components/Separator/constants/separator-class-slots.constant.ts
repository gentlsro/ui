// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const SEPARATOR_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex flex-center border-true-gray/40 rounded-full'

    // Horizontal styles via CSS selectors
    const horizontal = '[&.is-horizontal]:(w-full border-b-1 leading-0)'
    const horizontalSpaced = '[&.is-horizontal.is-spaced]:(m-b-.5 p-b-.5)'
    const horizontalInset = '[&.is-horizontal.is-inset]:(m-x-2 w-[calc(100%-1rem)])'

    // Vertical styles via CSS selectors
    const vertical = '[&.is-vertical]:(border-r-1)'
    const verticalSpaced = '[&.is-vertical.is-spaced]:(p-r-.5 m-r-.5)'
    const verticalInset = '[&.is-vertical.is-inset]:(m-y-1)'

    return {
      base,
      horizontal,
      horizontalSpaced,
      horizontalInset,
      vertical,
      verticalSpaced,
      verticalInset,
    } as const
  },
}

type SeparatorSlots<K extends keyof typeof SEPARATOR_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof SEPARATOR_CLASS_SLOTS[K]>>

export const SEPARATOR_CLASS_COMPOSERS = {
  containerClass(slots: SeparatorSlots<'containerClass'>) {
    return `${slots.base} ${slots.horizontal} ${slots.horizontalSpaced} ${slots.horizontalInset} ${slots.vertical} ${slots.verticalSpaced} ${slots.verticalInset}`
  },
}

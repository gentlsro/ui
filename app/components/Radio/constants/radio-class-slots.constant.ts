// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const RADIO_CLASS_SLOTS = {
  containerClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const base = 'relative flex items-center gap-2 cursor-pointer rounded-custom p-x-2 select-none'
    const tapHighlight = '-webkit-tap-highlight-color-transparent'

    // Size variants
    const sizes = {
      xs: 'min-h-6',
      sm: 'min-h-8',
      md: 'min-h-10',
      lg: 'min-h-12',
    } as const

    // States (via CSS selectors)
    const checked = ''
    const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

    return {
      base,
      tapHighlight,
      sizes,
      checked,
      disabled,
    } as const
  },

  radioClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
    color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
  }) {
    const base = 'appearance-none relative rounded-full shrink-0 cursor-pointer self-start'

    // Size variants
    const sizes = {
      xs: 'h-3.5 w-3.5 m-t-5px',
      sm: 'h-4 w-4 m-t-8px',
      md: 'h-5 w-5 m-t-10px',
      lg: 'h-6 w-6 m-t-12px',
    } as const

    // Color variants
    const colors = {
      primary: 'color-primary',
      secondary: 'color-secondary',
      positive: 'color-positive',
      warning: 'color-warning',
      negative: 'color-negative',
      info: 'color-info',
      light: 'color-light',
      dark: 'color-dark',
      darker: 'color-darker',
    } as const

    return {
      base,
      sizes,
      colors,
    } as const
  },

  labelClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const base = ''

    // Size variants
    const sizes = {
      xs: 'font-rem-13',
      sm: 'font-rem-14 p-y-2px',
      md: 'p-y-4px',
      lg: 'font-rem-18 p-y-6px',
    } as const

    return {
      base,
      sizes,
    } as const
  },

  focusHelperClass() {
    const base = 'absolute inset-0 z-3 cursor-pointer rounded-inherit'
    const hover = 'hover:bg-current hover:opacity-10'

    return {
      base,
      hover,
    } as const
  },
}

type RadioSlots<K extends keyof typeof RADIO_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof RADIO_CLASS_SLOTS[K]>>

export const RADIO_CLASS_COMPOSERS = {
  containerClass(slots: RadioSlots<'containerClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const { size } = payload

    return `${slots.base} ${slots.tapHighlight} ${slots.sizes[size]} ${slots.checked} ${slots.disabled}`
  },

  radioClass(slots: RadioSlots<'radioClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
    color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
  }) {
    const { size, color } = payload

    return `${slots.base} ${slots.sizes[size]} ${slots.colors[color]}`
  },

  labelClass(slots: RadioSlots<'labelClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const { size } = payload

    return `${slots.base} ${slots.sizes[size]}`
  },

  focusHelperClass(slots: RadioSlots<'focusHelperClass'>) {
    return `${slots.base} ${slots.hover}`
  },
}

// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const CHECKBOX_CLASS_SLOTS = {
  containerClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const base = 'flex items-start relative gap-2 cursor-pointer transition-all rounded-custom select-none rounded-2 !outline-none'

    // States
    const readonly = '[&.is-readonly]:(cursor-default)'
    const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

    const xs = 'min-h-7 p-x-1'
    const sm = 'min-h-8 p-x-1.5'
    const md = 'min-h-9 p-x-7px'
    const lg = 'min-h-10 p-x-2'

    const sizes = {
      xs,
      sm,
      md,
      lg,
    } as const

    return {
      base,
      readonly,
      disabled,
      sizes,
    } as const
  },

  checkboxClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
    color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
  }) {
    const base = 'flex flex-center border-2 shrink-0 self-start'
    const unchecked = 'group-[:not(.is-checked):not(.is-indeterminate)]/checkbox:bg-transparent'

    // Focus
    const focus = 'focus:(ring-2 ring-primary/50 ring-offset-2) focus-visible:(ring-2 ring-primary/50 ring-offset-2)'

    const primary = 'bg-primary border-primary'
    const secondary = 'bg-secondary border-secondary'
    const positive = 'bg-positive border-positive'
    const warning = 'bg-warning border-warning'
    const negative = 'bg-negative border-negative'
    const info = 'bg-info border-info'
    const light = 'bg-light border-light'
    const dark = 'bg-dark border-dark'
    const darker = 'bg-darker border-darker'

    const colors = {
      primary,
      secondary,
      positive,
      warning,
      negative,
      info,
      light,
      dark,
      darker,
    } as const

    const xs = 'h-4 rounded-1 w-4 m-y-1.5'
    const sm = 'h-4.5 rounded-1 w-4.5 m-y-1.75'
    const md = 'h-5 rounded-1.5 w-5 m-y-8px'
    const lg = 'h-6 rounded-1.5 w-6 m-y-8px'

    const sizes = {
      xs,
      sm,
      md,
      lg,
    } as const

    // Readonly state - dotted border, slightly faded colors
    const readonly = 'group-[.is-readonly]/checkbox:(border-dotted opacity-70)'

    // Disabled state - grayed out
    const disabled = 'group-[.is-disabled]/checkbox:(bg-true-gray border-true-gray)'

    return {
      base,
      unchecked,
      readonly,
      disabled,
      focus,
      colors,
      sizes,
    } as const
  },

  labelClass(_payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const base = 'leading-tight'

    const xs = 'font-rem-13 p-y-5.5px'
    const sm = 'font-rem-14 p-y-6px'
    const md = 'p-y-7px'
    const lg = 'font-rem-18 p-y-8px'

    const sizes = {
      xs,
      sm,
      md,
      lg,
    } as const

    return {
      base,
      sizes,
    } as const
  },

  focusHelperClass() {
    const base = 'absolute fit z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
    const hover = 'group-hover/checkbox:bg-current group-hover/checkbox:opacity-10'

    return {
      base,
      hover,
    } as const
  },
}

type CheckboxSlots<K extends keyof typeof CHECKBOX_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof CHECKBOX_CLASS_SLOTS[K]>>

export const CHECKBOX_CLASS_COMPOSERS = {
  containerClass(slots: CheckboxSlots<'containerClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.readonly} ${slots.disabled} ${slots.sizes[sizeProp]}`
  },

  checkboxClass(slots: CheckboxSlots<'checkboxClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
    color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
  }) {
    const { size: sizeProp, color: colorProp } = payload

    return `${slots.base} ${slots.unchecked} ${slots.readonly} ${slots.disabled} ${slots.colors[colorProp]} ${slots.sizes[sizeProp]} ${slots.focus}`
  },

  labelClass(slots: CheckboxSlots<'labelClass'>, payload: {
    size: 'xs' | 'sm' | 'md' | 'lg'
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.sizes[sizeProp]}`
  },

  focusHelperClass(slots: CheckboxSlots<'focusHelperClass'>) {
    return `${slots.base} ${slots.hover}`
  },
}

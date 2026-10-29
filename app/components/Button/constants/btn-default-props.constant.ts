// @unocss-include

import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export type ButtonSize = 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'

/** Independent of component overrides so class defaults can be inferred without a cycle. */
export type ButtonStyleProps = {
  size?: ButtonSize
  align?: 'left' | 'center' | 'right'
  noUppercase?: boolean
  noBold?: boolean
  noDim?: boolean
  round?: boolean
  rounded?: boolean
  outlined?: boolean
  stacked?: boolean
  disabled?: boolean
  disableStyle?: 'filled' | 'flat'
  hasLabel: boolean
}

export const BTN_CLASS_SLOTS = {
  containerClass(props: ButtonStyleProps) {
    const { size: sizeProp = 'md', hasLabel } = props

    const base = 'flex items-center tracking-wide relative select-none'
    const webkit = '[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]'
    const interactive = 'cursor-pointer'
    const uppercase = 'uppercase'
    const bold = 'font-semibold'
    const dimmed = 'opacity-80 hover:opacity-100'
    const round = 'rounded-full'
    const rounded = sizeProp === 'xs' ? 'rounded-1.5' : 'rounded-custom'
    const outlined = 'dark:bg-darker bg-white outline-solid outline-2 outline-current'
    const alignLeft = 'justify-start'
    const alignCenter = 'justify-center'
    const alignRight = 'justify-end'
    const stacked = 'flex-col flex-center p-y-1'
    const disabled = 'cursor-not-allowed [&>*]:cursor-not-allowed'
    const disabledFilled = 'disabled border-none'
    const disabledFlat = '!opacity-40'
    const noLabel = 'p-x-0'

    // Size variants
    const xs = `min-h-6 min-w-6 gap-x-2 ${hasLabel ? 'p-x-2' : ''}`
    const xm = `min-h-7 min-w-7 gap-x-2 ${hasLabel ? 'p-x-2' : ''}`
    const sm = `min-h-8 min-w-8 gap-x-2 gap-y-1 ${hasLabel ? 'p-x-2.5' : ''}`
    const md = `min-h-10 min-w-10 gap-x-2.5 gap-y-1 ${hasLabel ? 'p-x-3' : ''}`
    const lg = `min-h-12 min-w-12 gap-x-3 gap-y-1.5 ${hasLabel ? 'p-x-3.5' : ''}`
    const auto = ''

    const sizes = {
      xs,
      xm,
      sm,
      md,
      lg,
      auto,
    } as const

    return {
      base,
      webkit,
      interactive,
      uppercase,
      bold,
      dimmed,
      round,
      rounded,
      outlined,
      alignLeft,
      alignCenter,
      alignRight,
      stacked,
      disabled,
      disabledFilled,
      disabledFlat,
      noLabel,
      sizes,
    } as const
  },

  iconClass(_payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
  }) {
    const base = 'flex shrink-0'

    // Size variants
    const xs = 'h-3.5 w-3.5'
    const xm = 'h-4 w-4'
    const sm = 'h-4.5 w-4.5'
    const md = 'h-5.5 w-5.5'
    const lg = 'h-6.5 w-6.5'
    const auto = ''

    const sizes = {
      xs,
      xm,
      sm,
      md,
      lg,
      auto,
    } as const

    return {
      base,
      sizes,
    } as const
  },

  labelClass(_payload: Pick<ButtonStyleProps, 'size' | 'align'>) {
    const base = 'tracking-wider max-w-full'

    // Alignment variants via parent
    const alignLeft = 'text-left'
    const alignCenter = 'text-center'
    const alignRight = 'text-right'

    // Size variants
    const xs = 'font-rem-10 p-y-1 leading-none'
    const xm = 'font-rem-11 p-y-1.25 leading-none'
    const sm = 'font-rem-12 p-y-1.5'
    const md = 'font-rem-14 p-y-2'
    const lg = 'font-rem-16 p-y-2.5'
    const auto = 'font-rem-12'

    const sizes = {
      xs,
      xm,
      sm,
      md,
      lg,
      auto,
    } as const

    return {
      base,
      alignLeft,
      alignCenter,
      alignRight,
      sizes,
    } as const
  },

  focusHelperClass() {
    const base = 'absolute z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
    const hover = 'group-hover/btn:bg-current group-hover/btn:opacity-10'

    return {
      base,
      hover,
    } as const
  },

  loadingClass() {
    const base = 'absolute flex flex-center fit top-0 left-0 z-4 bg-white dark:bg-dark opacity-95 rounded-inherit cursor-wait'

    return {
      base,
    } as const
  },

  loaderClass(_payload: {
    size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
  }) {
    const base = ''

    // Size variants
    const xs = 'h-3.5 w-3.5'
    const xm = 'h-4 w-4'
    const sm = 'h-4.5 w-4.5'
    const md = 'h-5.5 w-5.5'
    const lg = 'h-6.5 w-6.5'
    const auto = ''

    const sizes = {
      xs,
      xm,
      sm,
      md,
      lg,
      auto,
    } as const

    return {
      base,
      sizes,
    } as const
  },
}

type StringSlots<T> = {
  [K in keyof T]: T[K] extends string ? string : StringSlots<T[K]>
}

type ButtonSlots<K extends keyof typeof BTN_CLASS_SLOTS>
  = StringSlots<ReturnType<typeof BTN_CLASS_SLOTS[K]>>

export const BTN_CLASS_COMPOSERS = {
  containerClass(slots: ButtonSlots<'containerClass'>, props: ButtonStyleProps) {
    return [
      slots.base,
      slots.webkit,
      slots.sizes[props.size ?? 'md'],
      !props.disabled && slots.interactive,
      !props.noUppercase && slots.uppercase,
      !props.noBold && slots.bold,
      !props.noDim && slots.dimmed,
      props.round && slots.round,
      props.rounded && !props.round && slots.rounded,
      props.outlined && slots.outlined,
      props.align === 'left' && slots.alignLeft,
      props.align === 'center' && slots.alignCenter,
      props.align === 'right' && slots.alignRight,
      props.stacked && slots.stacked,
      props.disabled && slots.disabled,
      props.disabled && props.disableStyle === 'filled' && slots.disabledFilled,
      props.disabled && props.disableStyle === 'flat' && slots.disabledFlat,
      !props.hasLabel && slots.noLabel,
    ].filter(Boolean).join(' ')
  },

  iconClass(slots: ButtonSlots<'iconClass'>, props: Parameters<typeof BTN_CLASS_SLOTS.iconClass>[0]) {
    return `${slots.base} ${slots.sizes[props.size]}`
  },

  labelClass(slots: ButtonSlots<'labelClass'>, props: Pick<ButtonStyleProps, 'size' | 'align'>) {
    return [
      slots.base,
      slots.sizes[props.size ?? 'md'],
      props.align === 'left' && slots.alignLeft,
      props.align === 'center' && slots.alignCenter,
      props.align === 'right' && slots.alignRight,
    ].filter(Boolean).join(' ')
  },

  focusHelperClass(slots: ButtonSlots<'focusHelperClass'>) {
    return `${slots.base} ${slots.hover}`
  },

  loadingClass(slots: ButtonSlots<'loadingClass'>) {
    return slots.base
  },

  loaderClass(slots: ButtonSlots<'loaderClass'>, props: Parameters<typeof BTN_CLASS_SLOTS.loaderClass>[0]) {
    return `${slots.base} ${slots.sizes[props.size]}`
  },
}

export const BTN_DEFAULT_PROPS = {
  ui: createUIClassResolver('button', {
    slots: BTN_CLASS_SLOTS,
    compose: BTN_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

/**
 * Sizes `labelBreakpoint` takes: the UnoCSS container sizes (`@2xl:` …), so a
 * button drops its label where the container's other `@…:` classes switch
 */
export const BTN_LABEL_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as const

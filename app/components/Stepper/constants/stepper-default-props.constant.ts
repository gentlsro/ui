// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

type IStepperSize = 'xs' | 'sm' | 'md' | 'lg'
type IStepperLayout = 'horizontal' | 'horizontalBottom' | 'vertical'

export const STEPPER_CLASS_SLOTS = {
  containerClass(_payload: {
    layout: IStepperLayout
    size: IStepperSize
  }) {
    const base = 'flex w-full'

    const layouts = {
      horizontal: 'flex-col gap-4',
      horizontalBottom: 'flex-col gap-4',
      vertical: 'items-start gap-6',
    } as const

    // Size variants ~ the indicator size is shared with the separator positioning
    const sizes = {
      xs: '[--stepper-indicator:1.5rem]',
      sm: '[--stepper-indicator:1.75rem]',
      md: '[--stepper-indicator:2rem]',
      lg: '[--stepper-indicator:2.5rem]',
    } as const

    return {
      base,
      layouts,
      sizes,
    } as const
  },

  navigationClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'flex'

    const layouts = {
      horizontal: 'w-full items-center gap-2',
      horizontalBottom: 'w-full items-start',
      vertical: 'flex-col shrink-0',
    } as const

    return {
      base,
      layouts,
    } as const
  },

  itemClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'flex min-w-0'

    const layouts = {
      horizontal: 'items-center gap-2 flex-auto [&.is-last]:flex-initial',
      horizontalBottom: 'relative flex-col items-center flex-1',
      vertical: 'flex-col',
    } as const

    return {
      base,
      layouts,
    } as const
  },

  triggerClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'flex min-w-0 p-0 bg-transparent border-none rounded-custom color-inherit outline-none'
    const interactive = 'cursor-pointer disabled:cursor-default focus-visible:(ring-2 ring-primary/50)'
    const disabled = '[&.is-disabled]:opacity-50'

    const layouts = {
      horizontal: 'items-center gap-2 text-left',
      horizontalBottom: 'flex-col items-center gap-2 p-x-2 text-center',
      vertical: 'items-start gap-3 text-left',
    } as const

    return {
      base,
      interactive,
      disabled,
      layouts,
    } as const
  },

  indicatorClass(_payload: {
    size: IStepperSize
  }) {
    const base = 'flex flex-center shrink-0 rounded-full border-2 border-solid font-semibold leading-none tabular-nums'
    const dimensions = 'w-[var(--stepper-indicator)] h-[var(--stepper-indicator)]'
    const transition = 'transition-[color,background-color,border-color,box-shadow] duration-200'

    // State styling via CSS selectors
    const upcoming = '[&.is-upcoming]:(border-true-gray-300 bg-white color-ca dark:(border-true-gray-600 bg-darker))'
    const active = '[&.is-active]:(border-primary bg-primary color-white ring-4 ring-primary/20)'
    const completed = '[&.is-completed]:(border-primary bg-primary color-white)'
    const error = '[&.is-error]:(border-negative bg-negative color-white)'

    // Size variants
    const sizes = {
      xs: 'font-rem-10',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    } as const

    return {
      base,
      dimensions,
      transition,
      upcoming,
      active,
      completed,
      error,
      sizes,
    } as const
  },

  iconClass(_payload: {
    size: IStepperSize
  }) {
    const base = 'shrink-0'

    // Size variants
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    } as const

    return {
      base,
      sizes,
    } as const
  },

  separatorClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'shrink-0 rounded-full bg-true-gray-300 dark:bg-true-gray-600 transition-colors duration-200'

    // State styling via CSS selectors
    const completed = '[&.is-completed]:bg-primary'

    const horizontal = 'flex-1 h-0.5 min-w-4'
    const horizontalBottom = 'absolute h-0.5 top-[calc(var(--stepper-indicator)/2_-_1px)] left-[calc(50%_+_var(--stepper-indicator)/2_+_0.5rem)] right-[calc(-50%_+_var(--stepper-indicator)/2_+_0.5rem)]'
    const vertical = 'self-start w-0.5 min-h-6 m-y-1 m-x-[calc(var(--stepper-indicator)/2_-_1px)]'

    const layouts = {
      horizontal,
      horizontalBottom,
      vertical,
    } as const

    return {
      base,
      completed,
      layouts,
    } as const
  },

  textClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'flex flex-col gap-0.5 min-w-0'

    const layouts = {
      horizontal: 'justify-center min-h-[var(--stepper-indicator)]',
      horizontalBottom: 'items-center',
      vertical: 'justify-center min-h-[var(--stepper-indicator)]',
    } as const

    return {
      base,
      layouts,
    } as const
  },

  labelClass(_payload: {
    size: IStepperSize
  }) {
    const base = 'font-semibold leading-tight truncate color-darker dark:color-white transition-colors duration-200'

    // State styling via CSS selectors
    const upcoming = '[&.is-upcoming]:color-ca'
    const error = '[&.is-error]:color-negative'

    // Size variants
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    } as const

    return {
      base,
      upcoming,
      error,
      sizes,
    } as const
  },

  descriptionClass(_payload: {
    size: IStepperSize
  }) {
    const base = 'leading-tight color-ca line-clamp-2'

    // State styling via CSS selectors
    const error = '[&.is-error]:color-negative/80'

    // Size variants
    const sizes = {
      xs: 'font-rem-10',
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    } as const

    return {
      base,
      error,
      sizes,
    } as const
  },

  panelsClass(_payload: {
    layout: IStepperLayout
  }) {
    const base = 'min-w-0'

    // Takes no space (and no container gap) when the active step has no content
    const empty = '[&:not(:has(>.step:not(:empty)))]:hidden'

    const layouts = {
      horizontal: 'w-full',
      horizontalBottom: 'w-full',
      vertical: 'flex-1',
    } as const

    return {
      base,
      empty,
      layouts,
    } as const
  },

  stepClass() {
    const base = 'w-full'

    return {
      base,
    } as const
  },
}

type StepperSlots<K extends keyof typeof STEPPER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof STEPPER_CLASS_SLOTS[K]>>

export const STEPPER_CLASS_COMPOSERS = {
  containerClass(slots: StepperSlots<'containerClass'>, payload: {
    layout: IStepperLayout
    size: IStepperSize
  }) {
    const { layout: layoutProp, size: sizeProp } = payload

    return `${slots.base} ${slots.layouts[layoutProp]} ${slots.sizes[sizeProp]}`
  },

  navigationClass(slots: StepperSlots<'navigationClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.layouts[layoutProp]}`
  },

  itemClass(slots: StepperSlots<'itemClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.layouts[layoutProp]}`
  },

  triggerClass(slots: StepperSlots<'triggerClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.interactive} ${slots.disabled} ${slots.layouts[layoutProp]}`
  },

  indicatorClass(slots: StepperSlots<'indicatorClass'>, payload: {
    size: IStepperSize
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.dimensions} ${slots.transition} ${slots.upcoming} ${slots.active} ${slots.completed} ${slots.error} ${slots.sizes[sizeProp]}`
  },

  iconClass(slots: StepperSlots<'iconClass'>, payload: {
    size: IStepperSize
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.sizes[sizeProp]}`
  },

  separatorClass(slots: StepperSlots<'separatorClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.completed} ${slots.layouts[layoutProp]}`
  },

  textClass(slots: StepperSlots<'textClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.layouts[layoutProp]}`
  },

  labelClass(slots: StepperSlots<'labelClass'>, payload: {
    size: IStepperSize
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.upcoming} ${slots.error} ${slots.sizes[sizeProp]}`
  },

  descriptionClass(slots: StepperSlots<'descriptionClass'>, payload: {
    size: IStepperSize
  }) {
    const { size: sizeProp } = payload

    return `${slots.base} ${slots.error} ${slots.sizes[sizeProp]}`
  },

  panelsClass(slots: StepperSlots<'panelsClass'>, payload: {
    layout: IStepperLayout
  }) {
    const { layout: layoutProp } = payload

    return `${slots.base} ${slots.empty} ${slots.layouts[layoutProp]}`
  },

  stepClass(slots: StepperSlots<'stepClass'>) {
    return `${slots.base}`
  },
}

export const STEPPER_DEFAULT_PROPS = {
  ui: createUIClassResolver('stepper', {
    slots: STEPPER_CLASS_SLOTS,
    compose: STEPPER_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

// @unocss-include

type IStepperSize = 'xs' | 'sm' | 'md' | 'lg'
type IStepperLayout = 'horizontal' | 'horizontalBottom' | 'vertical'

export const STEPPER_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      layout: IStepperLayout
      size: IStepperSize
    }) {
      const { layout: layoutProp, size: sizeProp } = payload

      const base = 'flex w-full'

      const layouts = {
        horizontal: 'flex-col gap-4',
        horizontalBottom: 'flex-col gap-4',
        vertical: 'items-start gap-6',
      } as const

      const layout = layouts[layoutProp]

      // Size variants ~ the indicator size is shared with the separator positioning
      const sizes = {
        xs: '[--stepper-indicator:1.5rem]',
        sm: '[--stepper-indicator:1.75rem]',
        md: '[--stepper-indicator:2rem]',
        lg: '[--stepper-indicator:2.5rem]',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        layouts,
        sizes,
        all: `${base} ${layout} ${size}`,
      } as const
    },

    navigationClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

      const base = 'flex'

      const layouts = {
        horizontal: 'w-full items-center gap-2',
        horizontalBottom: 'w-full items-start',
        vertical: 'flex-col shrink-0',
      } as const

      const layout = layouts[layoutProp]

      return {
        base,
        layouts,
        all: `${base} ${layout}`,
      } as const
    },

    itemClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

      const base = 'flex min-w-0'

      const layouts = {
        horizontal: 'items-center gap-2 flex-auto [&.is-last]:flex-initial',
        horizontalBottom: 'relative flex-col items-center flex-1',
        vertical: 'flex-col',
      } as const

      const layout = layouts[layoutProp]

      return {
        base,
        layouts,
        all: `${base} ${layout}`,
      } as const
    },

    triggerClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

      const base = 'flex min-w-0 p-0 bg-transparent border-none rounded-custom color-inherit outline-none'
      const interactive = 'cursor-pointer disabled:cursor-default focus-visible:(ring-2 ring-primary/50)'
      const disabled = '[&.is-disabled]:opacity-50'

      const layouts = {
        horizontal: 'items-center gap-2 text-left',
        horizontalBottom: 'flex-col items-center gap-2 p-x-2 text-center',
        vertical: 'items-start gap-3 text-left',
      } as const

      const layout = layouts[layoutProp]

      return {
        base,
        interactive,
        disabled,
        layouts,
        all: `${base} ${interactive} ${disabled} ${layout}`,
      } as const
    },

    indicatorClass(payload: {
      size: IStepperSize
    }) {
      const { size: sizeProp } = payload

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

      const size = sizes[sizeProp]

      return {
        base,
        dimensions,
        transition,
        upcoming,
        active,
        completed,
        error,
        sizes,
        all: `${base} ${dimensions} ${transition} ${upcoming} ${active} ${completed} ${error} ${size}`,
      } as const
    },

    iconClass(payload: {
      size: IStepperSize
    }) {
      const { size: sizeProp } = payload

      const base = 'shrink-0'

      // Size variants
      const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },

    separatorClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

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

      const layout = layouts[layoutProp]

      return {
        base,
        completed,
        layouts,
        all: `${base} ${completed} ${layout}`,
      } as const
    },

    textClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

      const base = 'flex flex-col gap-0.5 min-w-0'

      const layouts = {
        horizontal: 'justify-center min-h-[var(--stepper-indicator)]',
        horizontalBottom: 'items-center',
        vertical: 'justify-center min-h-[var(--stepper-indicator)]',
      } as const

      const layout = layouts[layoutProp]

      return {
        base,
        layouts,
        all: `${base} ${layout}`,
      } as const
    },

    labelClass(payload: {
      size: IStepperSize
    }) {
      const { size: sizeProp } = payload

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

      const size = sizes[sizeProp]

      return {
        base,
        upcoming,
        error,
        sizes,
        all: `${base} ${upcoming} ${error} ${size}`,
      } as const
    },

    descriptionClass(payload: {
      size: IStepperSize
    }) {
      const { size: sizeProp } = payload

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

      const size = sizes[sizeProp]

      return {
        base,
        error,
        sizes,
        all: `${base} ${error} ${size}`,
      } as const
    },

    panelsClass(payload: {
      layout: IStepperLayout
    }) {
      const { layout: layoutProp } = payload

      const base = 'min-w-0'

      // Takes no space (and no container gap) when the active step has no content
      const empty = '[&:not(:has(>.step:not(:empty)))]:hidden'

      const layouts = {
        horizontal: 'w-full',
        horizontalBottom: 'w-full',
        vertical: 'flex-1',
      } as const

      const layout = layouts[layoutProp]

      return {
        base,
        empty,
        layouts,
        all: `${base} ${empty} ${layout}`,
      } as const
    },

    stepClass() {
      const base = 'w-full'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

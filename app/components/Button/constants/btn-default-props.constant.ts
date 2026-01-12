// @unocss-include

export const BTN_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
    }) {
      const { size: sizeProp } = payload

      const base = 'flex items-center tracking-wide relative cursor-pointer select-none'
      const webkit = '[-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]'

      // State modifiers
      const uppercase = '[&.is-uppercase]:uppercase'
      const bold = '[&.is-bold]:font-semibold'
      const dimmed = '[&.is-dimmed]:(opacity-80 hover:opacity-100)'
      const round = '[&.is-round]:rounded-full'
      const rounded = '[&.is-rounded]:rounded-custom'
      const outlined = '[&.is-outlined]:(dark:bg-darker bg-white border-solid border-2 border-current)'

      // Alignment
      const alignLeft = '[&.is-left]:justify-start'
      const alignCenter = '[&.is-center]:justify-center'
      const alignRight = '[&.is-right]:justify-end'

      // Stacked
      const stacked = '[&.is-stacked]:(flex-col flex-center p-y-1)'

      // Disabled
      const disabled = '[&.is-disabled]:cursor-not-allowed [&.is-disabled>*]:cursor-not-allowed'
      const disabledFilled = '[&.is-disabled.is-disabled--filled]:(disabled border-none)'
      const disabledFlat = '[&.is-disabled.is-disabled--flat]:!opacity-40'

      // No label - remove horizontal padding
      const noLabel = '[&:not(.has-label)]:p-x-0'

      // Size variants
      let size = ''

      const xs = 'min-h-6 min-w-6 gap-x-2 p-x-2 [&.is-rounded]:rounded-1.5'
      const xm = 'min-h-7 min-w-7 gap-x-2 p-x-2'
      const sm = 'min-h-8 min-w-8 gap-x-1.5 gap-y-1 p-x-2.5'
      const md = 'min-h-10 min-w-10 gap-x-2 gap-y-1 p-x-3'
      const lg = 'min-h-12 min-w-12 gap-x-2.5 gap-y-1.5 p-x-3.5'
      const auto = ''

      const sizes = {
        xs,
        xm,
        sm,
        md,
        lg,
        auto,
      } as const

      size = sizes[sizeProp]

      return {
        base,
        webkit,
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
        all: `${base} ${webkit} ${uppercase} ${bold} ${dimmed} ${round} ${rounded} ${outlined} ${alignLeft} ${alignCenter} ${alignRight} ${stacked} ${disabled} ${disabledFilled} ${disabledFlat} ${noLabel} ${size}`,
      } as const
    },

    iconClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
    }) {
      const { size: sizeProp } = payload

      const base = 'flex shrink-0'

      // Size variants
      let size = ''

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

      size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },

    labelClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
    }) {
      const { size: sizeProp } = payload

      const base = 'tracking-wider max-w-full'

      // Alignment variants via parent
      const alignLeft = 'group-[.is-left]:text-left'
      const alignCenter = 'group-[.is-center]:text-center'
      const alignRight = 'group-[.is-right]:text-right'

      // Size variants
      let size = ''

      const xs = 'font-rem-10 p-y-1 leading-none'
      const xm = 'font-rem-11 p-y-1.25'
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

      size = sizes[sizeProp]

      return {
        base,
        alignLeft,
        alignCenter,
        alignRight,
        sizes,
        all: `${base} ${alignLeft} ${alignCenter} ${alignRight} ${size}`,
      } as const
    },

    focusHelperClass() {
      const base = 'absolute fit z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
      const hover = 'group-hover/btn:bg-current group-hover/btn:opacity-10'

      return {
        base,
        hover,
        all: `${base} ${hover}`,
      } as const
    },

    loadingClass() {
      const base = 'absolute flex flex-center fit top-0 left-0 z-4 bg-white dark:bg-dark opacity-95 rounded-inherit cursor-wait'

      return {
        base,
        all: base,
      } as const
    },

    loaderClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg' | 'auto'
    }) {
      const { size: sizeProp } = payload

      const base = ''

      // Size variants
      let size = ''

      const xs = 'h-3.5'
      const xm = 'h-4'
      const sm = 'h-4.5'
      const md = 'h-5.5'
      const lg = 'h-6.5'
      const auto = ''

      const sizes = {
        xs,
        xm,
        sm,
        md,
        lg,
        auto,
      } as const

      size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },
  },
}

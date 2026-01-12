// @unocss-include

export const CHECKBOX_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
    }) {
      const { size: sizeProp } = payload

      const base = 'flex items-center relative gap-2 cursor-pointer transition-all rounded-custom select-none rounded-2 !outline-none'

      // States
      const readonly = '[&.is-readonly]:(cursor-default)'
      const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

      // Size variants
      let size = ''

      const xs = 'min-h-6 p-x-1.5'
      const sm = 'min-h-7 p-x-2'
      const md = 'min-h-8 p-x-2.5'
      const lg = 'min-h-9 p-x-3'

      const sizes = {
        xs,
        sm,
        md,
        lg,
      } as const

      size = sizes[sizeProp]

      return {
        base,
        readonly,
        disabled,
        sizes,
        all: `${base} ${readonly} ${disabled} ${size}`,
      } as const
    },

    checkboxClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
      color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
    }) {
      const { size: sizeProp, color: colorProp } = payload

      const base = 'flex flex-center border-2 shrink-0 self-start'
      const unchecked = 'group-[:not(.is-checked):not(.is-indeterminate)]/checkbox:bg-transparent'

      // Focus
      const focus = 'focus:(ring-2 ring-primary/50 ring-offset-2) focus-visible:(ring-2 ring-primary/50 ring-offset-2)'

      // Color variants
      let color = ''

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

      color = colors[colorProp]

      // Size variants (via parent group)
      let size = ''

      const xs = 'h-4 rounded-1 w-4 m-t-1'
      const sm = 'h-4.5 rounded-1 w-4.5 m-t-1.25'
      const md = 'h-5.5 rounded-1.5 w-5.5 m-t-5px'
      const lg = 'h-6 rounded-1.5 w-6 m-t-6px'

      const sizes = {
        xs,
        sm,
        md,
        lg,
      } as const

      size = sizes[sizeProp]

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
        all: `${base} ${unchecked} ${readonly} ${disabled} ${color} ${size} ${focus}`,
      } as const
    },

    labelClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
    }) {
      const { size: sizeProp } = payload

      const base = 'leading-tight'

      // Size variants (via parent group)
      let size = ''

      const xs = 'font-rem-13 p-y-0.5'
      const sm = 'font-rem-14 p-y-1'
      const md = 'p-y-1'
      const lg = 'font-rem-18 p-y-1 m-t-1px'

      const sizes = {
        xs,
        sm,
        md,
        lg,
      } as const

      size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },

    focusHelperClass() {
      const base = 'absolute fit z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
      const hover = 'group-hover/checkbox:bg-current group-hover/checkbox:opacity-10'

      return {
        base,
        hover,
        all: `${base} ${hover}`,
      } as const
    },
  },
}

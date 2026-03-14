// @unocss-include

export const RADIO_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
    }) {
      const { size } = payload

      const base = 'relative flex items-center gap-2 cursor-pointer rounded-custom p-x-2 select-none'
      const tapHighlight = '-webkit-tap-highlight-color-transparent'

      // Size variants
      const sizes = {
        xs: 'min-h-6',
        sm: 'min-h-8',
        md: 'min-h-10',
        lg: 'min-h-12',
      } as const

      const sizeClass = sizes[size]

      // States (via CSS selectors)
      const checked = '[&.is-checked]:(font-semibold)'
      const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

      return {
        base,
        tapHighlight,
        sizes,
        checked,
        disabled,
        all: `${base} ${tapHighlight} ${sizeClass} ${checked} ${disabled}`,
      } as const
    },

    radioClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
      color: 'primary' | 'secondary' | 'positive' | 'warning' | 'negative' | 'info' | 'light' | 'dark' | 'darker'
    }) {
      const { size, color } = payload

      const base = 'appearance-none relative rounded-full shrink-0 cursor-pointer self-start'

      // Size variants
      const sizes = {
        xs: 'h-3.5 w-3.5 m-t-5px',
        sm: 'h-4.5 w-4.5 m-t-7px',
        md: 'h-5.5 w-5.5 m-t-9px',
        lg: 'h-6 w-6 m-t-12px',
      } as const

      const sizeClass = sizes[size]

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

      const colorClass = colors[color]

      return {
        base,
        sizes,
        colors,
        all: `${base} ${sizeClass} ${colorClass}`,
      } as const
    },

    labelClass(payload: {
      size: 'xs' | 'sm' | 'md' | 'lg'
    }) {
      const { size } = payload

      const base = ''

      // Size variants
      const sizes = {
        xs: 'font-rem-13',
        sm: 'font-rem-14 p-y-2px',
        md: 'p-y-4px',
        lg: 'font-rem-18 p-y-6px',
      } as const

      const sizeClass = sizes[size]

      return {
        base,
        sizes,
        all: `${base} ${sizeClass}`,
      } as const
    },

    focusHelperClass() {
      const base = 'absolute inset-0 z-3 cursor-pointer rounded-inherit'
      const hover = 'hover:bg-current hover:opacity-10'

      return {
        base,
        hover,
        all: `${base} ${hover}`,
      } as const
    },
  },
}


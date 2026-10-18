// @unocss-include

import type { IBtnProps } from '../types/btn-props.type'
import type { BREAKPOINTS } from '../../../constants/breakpoints'

type ButtonStyleProps = Pick<IBtnProps, 'size' | 'align' | 'noUppercase' | 'noBold' | 'noDim' | 'round' | 'rounded'
  | 'outlined' | 'stacked' | 'disabled' | 'disableStyle'> & { hasLabel: boolean }

export const BTN_DEFAULT_PROPS = {
  ui: {
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
      let size = ''

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

      size = sizes[sizeProp]

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
        all: [
          base,
          webkit,
          size,
          !props.disabled && interactive,
          !props.noUppercase && uppercase,
          !props.noBold && bold,
          !props.noDim && dimmed,
          props.round && round,
          props.rounded && !props.round && rounded,
          props.outlined && outlined,
          props.align === 'left' && alignLeft,
          props.align === 'center' && alignCenter,
          props.align === 'right' && alignRight,
          props.stacked && stacked,
          props.disabled && disabled,
          props.disabled && props.disableStyle === 'filled' && disabledFilled,
          props.disabled && props.disableStyle === 'flat' && disabledFlat,
          !hasLabel && noLabel,
        ].filter(Boolean).join(' '),
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

    labelClass(payload: Pick<ButtonStyleProps, 'size' | 'align'>) {
      const { size: sizeProp = 'md', align } = payload

      const base = 'tracking-wider max-w-full'

      // Alignment variants via parent
      const alignLeft = 'text-left'
      const alignCenter = 'text-center'
      const alignRight = 'text-right'

      // Size variants
      let size = ''

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

      size = sizes[sizeProp]

      return {
        base,
        alignLeft,
        alignCenter,
        alignRight,
        sizes,
        all: [base, size, align === 'left' && alignLeft, align === 'center' && alignCenter, align === 'right' && alignRight].filter(Boolean).join(' '),
      } as const
    },

    focusHelperClass() {
      const base = 'absolute z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
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
  },
}

/**
 * `labelBreakpoint`: below the breakpoint the label is hidden and the button
 * is as narrow as an icon-only one. Media queries, so the server renders it
 * right. Full class names, so UnoCSS finds them.
 */
export const BTN_LABEL_BREAKPOINT_CLASSES = {
  'xs': { label: 'lt-xs:hidden', container: 'lt-xs:p-x-0!' },
  'xm': { label: 'lt-xm:hidden', container: 'lt-xm:p-x-0!' },
  'sm': { label: 'lt-sm:hidden', container: 'lt-sm:p-x-0!' },
  'md': { label: 'lt-md:hidden', container: 'lt-md:p-x-0!' },
  'lg': { label: 'lt-lg:hidden', container: 'lt-lg:p-x-0!' },
  'xl': { label: 'lt-xl:hidden', container: 'lt-xl:p-x-0!' },
  '2xl': { label: 'lt-2xl:hidden', container: 'lt-2xl:p-x-0!' },
  '3xl': { label: 'lt-3xl:hidden', container: 'lt-3xl:p-x-0!' },
  '4xl': { label: 'lt-4xl:hidden', container: 'lt-4xl:p-x-0!' },
  'page': { label: 'lt-page:hidden', container: 'lt-page:p-x-0!' },
  'inf': { label: 'lt-inf:hidden', container: 'lt-inf:p-x-0!' },
} as const satisfies Record<keyof typeof BREAKPOINTS, { label: string, container: string }>

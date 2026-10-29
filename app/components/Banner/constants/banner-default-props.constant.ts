// @unocss-include

type IBannerVariant = 'none' | 'info' | 'warning' | 'error' | 'success'

export const BANNER_DEFAULT_PROPS = {
  ui: {
    badgeClass(payload: {
      variant: IBannerVariant
    }) {
      const { variant: variantProp } = payload

      const base = 'flex flex-center h-5 min-w-5 p-x-1.5 rounded-custom shadow-sm'
      const ring = 'ring-2 ring-white dark:ring-darker'
      const font = 'font-semibold font-rem-10 font-mono leading-none tabular-nums color-white'
      const position = 'absolute right--1.5 top--2'

      // Variants
      let variant = ''

      const none = 'bg-true-gray-500'
      const info = 'bg-info'
      const warning = 'bg-warning'
      const error = 'bg-negative'
      const success = 'bg-positive'

      const variants = {
        none,
        info,
        warning,
        error,
        success,
      } as const

      variant = variants[variantProp]

      return {
        base,
        ring,
        font,
        position,
        variants,
        all: `${base} ${ring} ${font} ${position} ${variant}`,
      } as const
    },

    containerClass(payload: {
      variant: IBannerVariant
      outlined: boolean
    }) {
      const { variant: variantProp, outlined: outlinedProp } = payload

      const base = 'relative flex gap-x-2.5 items-start rounded-lg p-x-3 p-y-2.5 text-sm'
      const font = 'color-true-gray-800 dark:color-true-gray-100'
      const outlined = '[&.is-outlined]:(border-1 border-solid bg-white dark:bg-darker shadow-sm)'
      const dismissable = '[&.is-dismissable]:(cursor-pointer p-r-9 transition-colors)'

      // Variants
      let variant = ''

      const noVariantContainer = 'bg-true-gray-500/8 ring-1 ring-inset ring-true-gray-500/15 dark:bg-true-gray-400/10 dark:ring-true-gray-400/15 [&.is-dismissable]:hover:bg-true-gray-500/12'
      const noVariantOutlinedContainer = 'border-true-gray-500/25 dark:border-true-gray-400/25'

      const infoContainer = 'bg-info/10 ring-1 ring-inset ring-info/25 dark:bg-info/15 dark:ring-info/30 [&.is-dismissable]:hover:bg-info/20'
      const infoContainerOutlined = 'border-info/55 [&.is-dismissable]:hover:bg-info/5'

      const warningContainer = 'bg-warning/10 ring-1 ring-inset ring-warning/25 dark:bg-warning/15 dark:ring-warning/30 [&.is-dismissable]:hover:bg-warning/20'
      const warningContainerOutlined = 'border-warning/55 [&.is-dismissable]:hover:bg-warning/5'

      const errorContainer = 'bg-negative/10 ring-1 ring-inset ring-negative/25 dark:bg-negative/15 dark:ring-negative/30 [&.is-dismissable]:hover:bg-negative/20'
      const errorContainerOutlined = 'border-negative/55 [&.is-dismissable]:hover:bg-negative/5'

      const successContainer = 'bg-positive/12 ring-1 ring-inset ring-positive/30 dark:bg-positive/15 [&.is-dismissable]:hover:bg-positive/22'
      const successContainerOutlined = 'border-positive/65 [&.is-dismissable]:hover:bg-positive/5'

      const variants = {
        none: noVariantContainer,
        noneOutlined: noVariantOutlinedContainer,
        info: infoContainer,
        infoOutlined: infoContainerOutlined,
        warning: warningContainer,
        warningOutlined: warningContainerOutlined,
        error: errorContainer,
        errorOutlined: errorContainerOutlined,
        success: successContainer,
        successOutlined: successContainerOutlined,
      } as const

      variant = outlinedProp ? variants[`${variantProp}Outlined`] : variants[variantProp]

      return {
        base,
        font,
        outlined,
        dismissable,
        variants,
        all: `${base} ${font} ${outlined} ${dismissable} ${variant}`,
      } as const
    },

    iconClass(payload: {
      variant: IBannerVariant
    }) {
      const { variant: variantProp } = payload

      const base = 'h-5 w-5 shrink-0 self-start m-t-0.5'

      // Icon
      let icon = ''

      const noneIcon = 'i-tabler:info-circle color-true-gray-500 dark:color-true-gray-400'
      const infoIcon = 'i-tabler:info-circle color-info'
      const warningIcon = 'i-tabler:alert-triangle color-warning'
      const errorIcon = 'i-tabler:circle-x color-negative'
      const successIcon = 'i-tabler:circle-check color-positive'

      const icons = {
        none: noneIcon,
        info: infoIcon,
        warning: warningIcon,
        error: errorIcon,
        success: successIcon,
      } as const

      icon = icons[variantProp]

      const centered = '[.banner.is-icon-center_&]:(self-center m-t-0)'

      return {
        base,
        icons,
        centered,
        all: `${base} ${icon} ${centered}`,
      } as const
    },

    labelClass() {
      const base = 'flex-1 min-w-0 p-y-0.5 leading-5 break-words'

      return {
        base,
        all: `${base}`,
      } as const
    },

    dismissClass() {
      const base = 'i-lucide:x absolute right-3 top-3.5 h-4 w-4 color-true-gray-400 transition-colors'
      const hover = 'group-hover/banner:color-true-gray-700 dark:group-hover/banner:color-true-gray-200'
      const centered = '[.banner.is-icon-center_&]:(top-50% translate-y--50%)'

      return {
        base,
        hover,
        centered,
        all: `${base} ${hover} ${centered}`,
      } as const
    },
  },
}

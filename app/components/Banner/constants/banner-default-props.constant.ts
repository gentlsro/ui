// @unocss-include

export const BANNER_DEFAULT_PROPS = {
  ui: {
    badgeClass(payload: {
      variant: 'none' | 'info' | 'warning' | 'error' | 'success'
    }) {
      const { variant: variantProp } = payload

      const base = 'rounded-2 flex flex-center p-1 border-2'
      const font = 'font-normal font-rem-12 font-mono leading-3 min-w-5 text-center color-white'
      const position = 'absolute right--2 top--2'

      // Variants
      let variant = ''

      const none = 'bg-truegray'
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
        font,
        position,
        variants,
        all: `${base} ${font} ${position} ${variant}`,
      } as const
    },

    containerClass(payload: {
      variant: 'none' | 'info' | 'warning' | 'error' | 'success'
      outlined: boolean
    }) {
      const { variant: variantProp, outlined: outlinedProp } = payload

      const base = 'flex gap-x-2 items-center rounded-custom p-2 relative'
      const outlined = '[&.is-outlined]:(border-2)'
      const dismissable = '[&.is-dismissable]:(cursor-pointer)'

      // Variants
      let variant = ''

      const noVariantContainer = 'color-true-gray'
      const noVariantOutlinedContainer = 'bg-inherit border-true-gray color-true-gray border-2'

      const infoContainer = 'bg-info color-white'
      const infoContainerOutlined = 'color-info border-info bg-info/15'

      const warningContainer = 'bg-warning color-white'
      const warningContainerOutlined = 'color-warning border-warning bg-warning/15'

      const errorContainer = 'bg-negative color-white'
      const errorContainerOutlined = 'color-negative border-negative bg-negative/15'

      const successContainer = 'bg-positive color-white'
      const successContainerOutlined = 'color-positive border-positive bg-positive/15'

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
        outlined,
        dismissable,
        variants,
        all: `${base} ${outlined} ${dismissable} ${variant}`,
      } as const
    },

    iconClass(payload: {
      variant: 'none' | 'info' | 'warning' | 'error' | 'success'
    }) {
      const { variant: variantProp } = payload

      const base = '!h-6 !w-6 shrink-0 self-start m-t-1'

      // Icon
      let icon = ''

      const noneIcon = 'i-lucide:info'
      const infoIcon = 'i-proicons:info'
      const warningIcon = 'i-fluent:warning-16-filled'
      const errorIcon = 'i-ci:error'
      const successIcon = 'i-akar-icons:circle-check-fill'

      const icons = {
        none: noneIcon,
        info: infoIcon,
        warning: warningIcon,
        error: errorIcon,
        success: successIcon,
      } as const

      icon = icons[variantProp]

      const centered = 'group-[.is-icon-center]/banner:(self-center m-t-0)'

      return {
        base,
        icons,
        centered,
        all: `${base} ${icon} ${centered}`,
      } as const
    },

    labelClass() {
      const base = 'p-y-1'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

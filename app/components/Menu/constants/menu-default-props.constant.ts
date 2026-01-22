// @unocss-include

// Types
import type { IMenuProps } from '../types/menu-props.type'

export const MENU_DEFAULT_PROPS = {
  ui: {
    menuClass() {
      const base = 'flex flex-col grow rounded-custom'
      const background = 'dark:bg-dark-950/90 bg-white/90 backdrop-blur-2px'
      const border = 'rounded-custom border-1 border-ca'
      const limits = 'max-w-95vw max-h-95%'
      const shadow = 'shadow-consistent-xs shadow-darker/20 shadow-light/8'

      return {
        base,
        background,
        border,
        limits,
        shadow,
        all: `${base} ${background} ${border} ${limits} ${shadow}`,
      } as const
    },

    contentClass() {
      const base = 'relative flex flex-col grow overflow-auto rounded-custom max-h-inherit'
      const dense = '[&.is-dense]:p-0'
      const padding = 'p-1'
      const gap = 'gap-1'

      return {
        base,
        dense,
        padding,
        gap,
        all: `${base} ${dense} ${padding} ${gap}`,
      } as const
    },

    headerClass() {
      const base = 'flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom'
      const font = 'font-semibold'
      const movable = '[&.is-movable]:cursor-move'

      return {
        base,
        font,
        movable,
        all: `${base} ${font} ${movable}`,
      } as const
    },

    titleClass() {
      const base = 'grow'

      return {
        base,
        all: `${base}`,
      } as const
    },

    overlayClass() {
      const base = 'fixed inset-0 transition-background-color ease bg-transparent bg-darker-70'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IMenuProps

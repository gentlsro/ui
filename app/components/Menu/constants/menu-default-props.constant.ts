// @unocss-include

// Types
import type { IMenuProps } from '../types/menu-props.type'

export const MENU_DEFAULT_PROPS = {
  ui: {
    menuClass() {
      const base = 'flex flex-col grow rounded-custom'
      // (a scope's surface and border, else white / dark-950 and slate-300 / dark-700)
      const background = 'bg-[rgb(var(--color-surface-rgb,255_255_255)/0.9)] dark:bg-[rgb(var(--color-surface-rgb,8_8_8)/0.9)] backdrop-blur-2px'
      const border = 'rounded-custom border-1 border-[rgb(var(--color-border-rgb,203_213_225))] dark:border-[rgb(var(--color-border-rgb,27_27_27))]'
      const limits = 'max-w-95vw max-h-95%'
      const shadow = 'light:(shadow-consistent-xs shadow-darker/12)'

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
      const base = 'fixed inset-0 transition-background-color ease bg-transparent'
      const active = '[&.is-active]:(bg-darker/70)'

      return {
        base,
        active,
        all: `${base} ${active}`,
      } as const
    },
  },
} satisfies IMenuProps

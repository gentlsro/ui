// @unocss-include

export const DRAWER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'fixed flex flex-col gap-1 top-0 bg-light-200 dark:bg-dark-800 z-$zDrawer max-w-full overflow-auto'

      // Side positioning
      const right = '[&.drawer--right]:(right-0 translate-x-100%)'
      const left = '[&.drawer--left]:(left-0 translate-x--100%)'

      // State
      const open = '[&.is-open]:(!translate-x-0 opacity-100)'
      const closed = 'opacity-0'

      // Absolute positioning
      const absolute = '[&.is-absolute]:(absolute bottom-0)'
      const notAbsolute = '[&:not(.is-absolute)]:(h-full)'
      const notFullHeightNotAbsolute = '[&:not(.is-full-height):not(.is-absolute)]:(m-t-$navHeight)'

      return {
        base,
        right,
        left,
        open,
        closed,
        absolute,
        notAbsolute,
        notFullHeightNotAbsolute,
        all: `${base} ${right} ${left} ${open} ${closed} ${absolute} ${notAbsolute} ${notFullHeightNotAbsolute}`,
      } as const
    },

    titleClass() {
      const base = 'flex gap-2 items-center'

      return {
        base,
        all: base,
      } as const
    },
  },
}

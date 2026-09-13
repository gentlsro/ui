// @unocss-include

export const DRAWER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-1 top-0 bg-white/85 dark:bg-dark-950/95 z-$zDrawer max-w-full overflow-auto'

      // Side positioning (overlay modes only ~ in the `relative` mode the drawer sits in the document flow)
      const right = '[&.drawer--right:not(.is-relative)]:(right-0 translate-x-100%)'
      const left = '[&.drawer--left:not(.is-relative)]:(left-0 translate-x--100%)'

      // State
      const open = '[&.is-open]:(!translate-x-0 opacity-100)'
      const closed = 'opacity-0'

      // Positioning modes
      const fixed = '[&:not(.is-absolute):not(.is-relative)]:(fixed h-full)'
      const absolute = '[&.is-absolute]:(absolute bottom-0)'
      const relative = '[&.is-relative]:(relative shrink-0 overflow-x-hidden)'
      const notFullHeightFixed = '[&:not(.is-full-height):not(.is-absolute):not(.is-relative)]:(m-t-$navHeight)'

      return {
        base,
        right,
        left,
        open,
        closed,
        fixed,
        absolute,
        relative,
        notFullHeightFixed,
        all: `${base} ${right} ${left} ${open} ${closed} ${fixed} ${absolute} ${relative} ${notFullHeightFixed}`,
      } as const
    },

    titleClass() {
      const base = 'flex gap-2 items-center p-1 m-1 rounded-custom bg-slate-100 dark:bg-dark-950'

      return {
        base,
        all: base,
      } as const
    },
  },
}

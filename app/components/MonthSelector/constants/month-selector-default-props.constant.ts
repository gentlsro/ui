// @unocss-include

export const MONTH_SELECTOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex gap-x-1 items-center'

      return {
        base,
        all: base,
      } as const
    },

    previousBtnClass() {
      const base = 'w-8 h-8 p-3 lt-xs:hidden'

      return {
        base,
        all: base,
      } as const
    },

    currentBtnClass() {
      const base = 'flex-1 h-8 self-center capitalize'

      return {
        base,
        all: base,
      } as const
    },

    nextBtnClass() {
      const base = 'w-8 h-8 p-3 lt-xs:hidden'

      return {
        base,
        all: base,
      } as const
    },

    gridContainerClass() {
      const base = 'grid grid-cols-2 xm:grid-cols-3 gap-1'

      return {
        base,
        all: base,
      } as const
    },

    monthBtnClass() {
      const base = 'capitalize'

      // States (via CSS selectors)
      const selected = '[&.is-selected]:(bg-primary color-white)'
      const current = '[&.is-current]:(border-2 border-ca)'

      return {
        base,
        selected,
        current,
        all: `${base} ${selected} ${current}`,
      } as const
    },
  },
}


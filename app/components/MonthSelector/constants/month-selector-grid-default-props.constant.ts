// @unocss-include

export const MONTH_SELECTOR_GRID_DEFAULT_PROPS = {
  ui: {
    containerClass() {
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
      const current = '[&.is-current]:(shadow-coolGray shadow-[0px_0px_0px_2px_var(--un-shadow-color)])'

      return {
        base,
        selected,
        current,
        all: `${base} ${selected} ${current}`,
      } as const
    },
  },
}


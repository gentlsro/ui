// @unocss-include

export const YEAR_SELECTOR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex gap-x-1 items-center'

      return {
        base,
        all: base,
      } as const
    },

    previousBtnClass() {
      const base = 'w-8 h-8 p-3 lt-xm:hidden'

      return {
        base,
        all: base,
      } as const
    },

    nextBtnClass() {
      const base = 'w-8 h-8 p-3 lt-xm:hidden'

      return {
        base,
        all: base,
      } as const
    },

    menuContainerClass() {
      const base = 'flex flex-col gap-1 grow'

      return {
        base,
        all: base,
      } as const
    },

    yearBtnClass() {
      // States (via CSS selectors)
      const selected = '[&.is-selected]:(bg-primary color-white)'

      return {
        selected,
        all: selected,
      } as const
    },
  },
}


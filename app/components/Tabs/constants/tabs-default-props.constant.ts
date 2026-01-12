// @unocss-include

export const TABS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col'

      return {
        base,
        all: base,
      } as const
    },

    navigationClass() {
      const base = 'shrink-0'

      return {
        base,
        all: base,
      } as const
    },

    navigationContentClass() {
      const base = 'flex gap-1'

      return {
        base,
        all: base,
      } as const
    },

    tabClass() {
      const base = 'fit'

      return {
        base,
        all: base,
      } as const
    },

    tabNavBtnClass() {
      const base = ''

      // State styling via CSS selectors
      const active = '[&.is-active]:(bg-primary color-white)'
      const inactive = '[&:not(.is-active)]:(color-ca)'

      return {
        base,
        active,
        inactive,
        all: `${base} ${active} ${inactive}`,
      } as const
    },
  },
}

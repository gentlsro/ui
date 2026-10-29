// @unocss-include

export const VALUE_FORMATTER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

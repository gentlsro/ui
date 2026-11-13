// @unocss-include

export const TREE_DMS_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

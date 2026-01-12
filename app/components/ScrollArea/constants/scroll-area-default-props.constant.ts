// @unocss-include

export const SCROLL_AREA_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'overflow-hidden ps-0'

      return {
        base,
        all: base,
      } as const
    },
  },
}

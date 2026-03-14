// @unocss-include

export const CIRCLE_PROGRESS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex flex-center'

      return {
        base,
        all: `${base}`,
      } as const
    },

    svgClass() {
      const base = 'origin-center'

      return {
        base,
        all: `${base}`,
      } as const
    },

    circleBgClass() {
      const base = 'stroke-#eee [stroke-linecap:round]'

      return {
        base,
        all: `${base}`,
      } as const
    },

    circleClass() {
      const base = '[stroke-linecap:round]'

      return {
        base,
        all: `${base}`,
      } as const
    },

    textClass() {
      const base = 'absolute text-lg font-semibold'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

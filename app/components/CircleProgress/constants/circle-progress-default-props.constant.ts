// @unocss-include

export const CIRCLE_PROGRESS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex flex-center'

      return withClassPicker({
        base,
        all: `${base}`,
      } as const)
    },

    svgClass() {
      const base = 'origin-center'

      return withClassPicker({
        base,
        all: `${base}`,
      } as const)
    },

    circleBgClass() {
      const base = 'stroke-#eee [stroke-linecap:round]'

      return withClassPicker({
        base,
        all: `${base}`,
      } as const)
    },

    circleClass() {
      const base = '[stroke-linecap:round]'

      return withClassPicker({
        base,
        all: `${base}`,
      } as const)
    },

    textClass() {
      const base = 'absolute text-lg font-semibold'

      return withClassPicker({
        base,
        all: `${base}`,
      } as const)
    },
  },
}

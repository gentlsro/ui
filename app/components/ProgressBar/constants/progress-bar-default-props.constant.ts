// @unocss-include

export const PROGRESS_BAR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex relative isolate h-8 rounded-custom'

      return {
        base,
        all: base,
      } as const
    },

    innerClass() {
      const base = 'absolute h-full'

      return {
        base,
        all: base,
      } as const
    },

    colorClass() {
      const base = 'bg-positive mix-blend-screen w-full z-4'

      return {
        base,
        all: base,
      } as const
    },

    whiteBgClass() {
      const base = 'bg-white w-full z-1'

      return {
        base,
        all: base,
      } as const
    },

    blackBgClass() {
      const base = 'bg-black z-2'

      return {
        base,
        all: base,
      } as const
    },

    textClass() {
      const base = 'absolute left-1/2 top-1/2 translate--50% color-slate-900 z-5 text-nowrap whitespace-nowrap'

      return {
        base,
        all: base,
      } as const
    },
  },
}

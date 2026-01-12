// @unocss-include

export const NOTIFICATIONS_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-y-1 transition-transform fixed z-$zMax min-w-240px max-w-320px lt-xm:max-w-280px flex-center'

      return {
        base,
        all: base,
      } as const
    },
  },
}

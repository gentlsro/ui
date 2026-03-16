// @unocss-include

export const CONFIRMATION_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col inset-0 absolute bg-white dark:bg-dark-950 rounded-custom z-$zMax'

      return {
        base,
        all: base,
      } as const
    },

    checkmarkClass() {
      const base = 'flex flex-col flex-center grow'

      return {
        base,
        all: base,
      } as const
    },

    textClass() {
      const base = 'font-rem-14 text-center p-x-4'

      return {
        base,
        all: base,
      } as const
    },

    actionsClass() {
      const base = 'flex items-center p-x-3 p-y-1 shrink-0 justify-end gap-x-3'

      return {
        base,
        all: base,
      } as const
    },
  },
}

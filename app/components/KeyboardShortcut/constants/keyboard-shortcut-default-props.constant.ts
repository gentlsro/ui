// @unocss-include

export const KEYBOARD_SHORTCUT_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex gap-1 items-center font-mono color-ca leading-none'

      return {
        base,
        all: base,
      } as const
    },

    wrapperClass() {
      const base = 'flex flex-center border-1 border-ca rounded-1 min-w-4.5 min-h-4.5 bg-white color-darker dark:(bg-darker color-white)'

      return {
        base,
        all: base,
      } as const
    },

    iconClass() {
      const base = 'h-4 w-4'

      return {
        base,
        all: base,
      } as const
    },
  },
}


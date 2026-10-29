// @unocss-include

export const MAIN_BAR_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex relative flex-col gap-x-2 p-t-2 z-$zMainBar w-full shrink-0 bg-white dark:bg-darker p-b-2'

      return {
        base,
        all: base,
      } as const
    },

    contentClass() {
      const base = 'flex gap-x-4 grow items-center rounded-custom'

      return {
        base,
        all: base,
      } as const
    },

    titleWrapperClass() {
      const base = 'flex flex-col grow overflow-auto relative rounded-custom'

      return {
        base,
        all: base,
      } as const
    },

    titleClass() {
      const base = ''

      return {
        base,
        all: base,
      } as const
    },

    subtitleClass() {
      const base = 'text-caption p-x-4 p-b-2 m-t--1'

      return {
        base,
        all: base,
      } as const
    },

    actionsClass() {
      const base = 'flex flex-col self-start m-t-1 m-x-2'

      return {
        base,
        all: base,
      } as const
    },
  },
}


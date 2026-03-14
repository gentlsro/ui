// @unocss-include

export const SCROLLER_DEFAULT_PROPS = {
  ui: {
    // Horizontal scroller container
    horizontalContainerClass() {
      const base = 'flex relative overflow-hidden'

      return {
        base,
        all: base,
      } as const
    },

    // Vertical scroller container
    verticalContainerClass() {
      const base = 'flex flex-col relative items-center overflow-hidden'

      return {
        base,
        all: base,
      } as const
    },

    contentClass() {
      const base = 'flex grow overflow-auto'

      return {
        base,
        all: base,
      } as const
    },

    verticalContentClass() {
      const base = 'flex flex-col flex-1 overflow-auto w-full'

      return {
        base,
        all: base,
      } as const
    },

    arrowClass() {
      const base = 'color-ca dark:hover:color-white hover:color-black'

      return {
        base,
        all: base,
      } as const
    },
  },
}

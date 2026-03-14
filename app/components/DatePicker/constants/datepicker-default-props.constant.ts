// @unocss-include

export const DATE_PICKER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col min-w-77 xm:w-70 overflow-auto'

      return {
        base,
        all: base,
      } as const
    },

    daysGridClass() {
      const base = 'grid grid-cols-7 border-t-1 border-ca'

      return {
        base,
        all: base,
      } as const
    },

    controlsClass() {
      const base = 'flex items-center p-x-1 p-y-px rounded-b-custom'
      const bg = 'bg-white dark:bg-dark-950'
      const border = 'border-t-1 border-ca'

      return {
        base,
        bg,
        border,
        all: `${base} ${bg} ${border}`,
      } as const
    },
  },
}

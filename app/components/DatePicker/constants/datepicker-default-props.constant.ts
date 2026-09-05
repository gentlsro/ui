// @unocss-include

export const DATE_PICKER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col overflow-auto bg-white color-slate-700 dark:bg-dark-950 dark:color-inherit'

      return {
        base,
        all: base,
      } as const
    },

    daysGridClass() {
      const base = 'grid grid-cols-7 gap-2px p-x-2 p-b-2'

      return {
        base,
        all: base,
      } as const
    },

    controlsClass() {
      const base = 'flex items-center p-x-2 p-y-1 rounded-b-custom'
      const bg = 'bg-white dark:bg-dark-950'
      const border = 'border-t-1 border-slate-100 dark:border-dark-700'

      return {
        base,
        bg,
        border,
        all: `${base} ${bg} ${border}`,
      } as const
    },
  },
}

// @unocss-include

export const COLLAPSE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex flex-col'

      return {
        base,
        all: `${base}`,
      } as const
    },

    headerClass() {
      const base = 'flex items-center gap-2 p-2 rounded-custom cursor-pointer'
      const bg = 'bg-white dark:bg-dark-950'

      // State styling via CSS selectors - when parent container is open, remove bottom radius
      const open = '[.collapse.is-open_&]:(rounded-b-0)'

      const border = 'light:(border-1 border-slate-300) dark:(border-1 border-black)'

      return {
        base,
        bg,
        border,
        open,
        all: `${base} ${bg} ${open} ${border}`,
      } as const
    },

    headerRightClass() {
      const base = 'flex self-center items-center gap-1 items-center self-start shrink-0'

      return {
        base,
        all: `${base}`,
      } as const
    },

    titleClass() {
      const base = 'font-rem-14 font-semibold'
      const color = 'color-slate-900 dark:color-slate-100'

      return {
        base,
        color,
        all: `${base} ${color}`,
      } as const
    },

    subtitleClass() {
      const base = 'text-caption leading-tight font-rem-12'

      return {
        base,
        all: `${base}`,
      } as const
    },

    expandIconClass() {
      const base = 'i-majesticons:chevron-right transition-transform'
      // State styling via CSS selectors - rotate when parent is open
      const open = '[.collapse.is-open_&]:(rotate-90deg)'

      return {
        base,
        open,
        all: `${base} ${open}`,
      } as const
    },

    textClass() {
      const base = 'flex flex-col grow'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      const base = 'flex flex-col overflow-auto rounded-b-custom'
      const bg = 'bg-white dark:bg-dark-950'
      const border = 'border-t-1 border-ca'
      const floating = '[&.is-floating]:(absolute z-11 left-0 right-0 bottom-0 translate-y-full)'

      return {
        base,
        bg,
        floating,
        border,
        all: `${base} ${bg} ${floating} ${border}`,
      } as const
    },

    contentInnerClass() {
      const base = 'flex flex-col p-2'

      return {
        base,
        all: base,
      } as const
    },
  },
}

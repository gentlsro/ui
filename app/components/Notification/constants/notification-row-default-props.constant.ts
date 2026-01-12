// @unocss-include

export const NOTIFICATION_ROW_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'relative flex flex-col rounded-custom w-80 md:w-100 p-x-4 p-y-2 bg-slate-100/80 dark:bg-dark-950/80 backdrop-blur-2px'

      // Left progress bar (before pseudo-element)
      const leftBar = 'before:(content-empty absolute left-0 top-0 h-full w-1 rounded-l-custom bg-current)'

      // Right progress bar (after pseudo-element) - uses CSS variable for height
      const rightBar = 'after:(content-empty absolute right-0 bottom-0 w-1 rounded-r-custom bg-current h-$progress)'

      // Type variants via CSS selectors
      const positive = '[&.is-positive]:color-green-500'
      const negative = '[&.is-negative]:color-red-500'
      const warning = '[&.is-warning]:color-amber-500'
      const info = '[&.is-info]:color-info'
      const primary = '[&.is-primary]:color-primary'
      const secondary = '[&.is-secondary]:color-secondary'

      return {
        base,
        leftBar,
        rightBar,
        positive,
        negative,
        warning,
        info,
        primary,
        secondary,
        all: `${base} ${leftBar} ${rightBar} ${positive} ${negative} ${warning} ${info} ${primary} ${secondary}`,
      } as const
    },

    titleRowClass() {
      const base = 'flex gap-x-2 w-full items-center'

      return {
        base,
        all: base,
      } as const
    },

    iconClass() {
      const base = 'shrink-0 self-start h-6 w-6 m-t-1.5'

      return {
        base,
        all: base,
      } as const
    },

    titleClass() {
      const base = 'grow overflow-auto'
      const withSubtitle = '[&.has-subtitle]:(font-bold tracking-wide)'

      return {
        base,
        withSubtitle,
        all: `${base} ${withSubtitle}`,
      } as const
    },

    titleTextClass() {
      const base = 'max-w-full break-words'

      return {
        base,
        all: base,
      } as const
    },

    subtitleClass() {
      const base = 'tracking-wide text-sm color-black dark:color-white break-words p-b-3'

      return {
        base,
        all: base,
      } as const
    },

    subtitleItemClass() {
      const base = 'list-inside text-caption p-b-2'

      return {
        base,
        all: base,
      } as const
    },

    counterClass() {
      const base = 'absolute z-1 rounded-2 -top-2 -right-4 p-x-1 min-w-7 bg-inherit color-inherit border-2 border-current text-center'

      return {
        base,
        all: base,
      } as const
    },
  },
}

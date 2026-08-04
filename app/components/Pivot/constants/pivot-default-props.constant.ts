// @unocss-include

export const PIVOT_DEFAULT_PROPS = {
  ui: {
    topClass() {
      const base = 'flex shrink-0 bg-slate-600 color-white dark:(bg-black color-white)'

      return {
        base,
        all: base,
      } as const
    },

    headerClass() {
      const base = 'relative flex shrink-0'

      return {
        base,
        all: base,
      } as const
    },

    titleClass() {
      const base = 'flex items-center gap-2 font-rem-18 font-bold p-x-2 p-y-1 min-w-70'

      return {
        base,
        all: base,
      } as const
    },

    columnFiltersClass() {
      const base = 'flex gap-2 items-center border-r border-white/50 p-r-2'

      return {
        base,
        all: base,
      } as const
    },

    filtersClass() {
      const base = 'flex gap-2 items-center'

      return {
        base,
        all: base,
      } as const
    },

    rowHeaderClass() {
      const base = 'relative flex overflow-auto shrink-0 hide-scrollbar'
      const border = 'border-b border-light-8 dark:border-dark-6'
      const bg = 'bg-slate-200 dark:bg-dark-950'

      return {
        base,
        border,
        bg,
        all: `${base} ${border} ${bg}`,
      } as const
    },

    rowHeaderCellClass() {
      const base = 'font-rem-12 font-bold shrink-0 min-w-10 flex items-end p-x-2 p-y-1'
      const border = 'border-r border-light-8 dark:border-dark-6'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    containerClass() {
      const base = 'relative flex flex-col grow overflow-auto'
      const border = 'border-t border-l border-light-8 dark:border-dark-6'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    contentClass() {
      const base = 'flex overflow-auto grow'

      return {
        base,
        all: base,
      } as const
    },

    rowItemClass() {
      const base = 'flex'
      const subtotal = '[&.is-subtotal]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'
      const border = 'border-b border-light-8 dark:border-dark-6'
      const bg = 'bg-slate-100 dark:bg-dark-950'
      const alternate = '[&.is-odd]:(bg-white dark:bg-dark-900)'
      const hovered = '[&.is-hovered]:(!bg-slate-200 !dark:bg-black outline-1 outline-primary outline-solid outline-offset--1)'
      const clickable = '[&.is-clickable]:(cursor-pointer) [&.is-clickable:focus-visible]:(outline-2 outline-primary outline-solid outline-offset--2)'

      return {
        base,
        subtotal,
        grandTotal,
        border,
        alternate,
        hovered,
        clickable,
        bg,
        all: `${base} ${subtotal} ${grandTotal} ${bg} ${border} ${alternate} ${hovered} ${clickable}`,
      } as const
    },

    rowItemCellClass() {
      const base = 'font-rem-12 shrink-0 min-w-10 flex items-center gap-2 p-x-2 p-y-1'
      const border = 'border-r border-light-8 dark:border-dark-6'
      const collapsible = '[&.is-collapsible]:(p-l-1)'
      const total = '[&.is-total]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'

      return {
        base,
        collapsible,
        total,
        grandTotal,
        border,
        all: `${base} ${collapsible} ${total} ${grandTotal} ${border}`,
      } as const
    },

    valueHeaderClass() {
      const base = 'grow min-w-0 overflow-hidden p-r-$scrollbarWidth'
      const bg = 'bg-slate-200 dark:bg-dark-950'

      return {
        base,
        bg,
        all: `${base} ${bg}`,
      } as const
    },

    valueHeaderCellClass() {
      const base = 'font-rem-12 font-bold shrink-0 min-w-10 flex items-start gap-2 p-x-2 p-y-1'
      const border = 'border-r border-b border-light-8 dark:border-dark-6'
      const collapsible = '[&.is-collapsible]:(p-l-1)'

      return {
        base,
        collapsible,
        border,
        all: `${base} ${collapsible} ${border}`,
      } as const
    },

    valueItemClass() {
      const base = 'flex'
      const border = 'border-b border-light-8 dark:border-dark-6'
      const subtotal = '[&.is-subtotal]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'
      const bg = 'bg-slate-100 dark:bg-dark-950'
      const alternate = '[&.is-odd]:(bg-white dark:bg-dark-900)'
      const hovered = '[&.is-hovered]:(!bg-slate-200 !dark:bg-black outline-1 outline-primary outline-solid outline-offset--1)'

      return {
        base,
        subtotal,
        grandTotal,
        border,
        bg,
        alternate,
        hovered,
        all: `${base} ${subtotal} ${grandTotal} ${bg} ${border} ${alternate} ${hovered}`,
      } as const
    },

    valueItemCellClass() {
      const base = 'font-rem-12 shrink-0 min-w-10 flex items-center justify-end p-x-2 p-y-1'
      const border = 'border-r border-light-8 dark:border-dark-6'
      const total = '[&.is-total]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'
      const clickable = '[&.is-clickable]:(cursor-pointer) [&.is-clickable:focus-visible]:(outline-2 outline-primary outline-solid outline-offset--2)'

      return {
        base,
        total,
        grandTotal,
        clickable,
        border,
        all: `${base} ${total} ${grandTotal} ${border} ${clickable}`,
      } as const
    },

    valuesScrollerClass() {
      const base = 'grow overflow-x-scroll!'
      const border = 'border-l-1 border-light-8 dark:border-dark-6'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    rowsScrollerClass() {
      const base = 'hide-scrollbar'

      return {
        base,
        all: base,
      } as const
    },

    rowsWrapperClass() {
      const base = 'flex flex-col shrink-0 overflow-x-scroll'

      return {
        base,
        all: base,
      } as const
    },

    loadingClass() {
      const base = 'flex flex-center p-y-3 absolute inset-0 bg-white/68 dark:bg-dark-950/87 backdrop-blur-sm'

      return {
        base,
        all: base,
      } as const
    },
  },
}

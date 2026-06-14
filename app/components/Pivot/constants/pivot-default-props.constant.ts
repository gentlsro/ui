// @unocss-include

export const PIVOT_DEFAULT_PROPS = {
  ui: {
    headerClass() {
      const base = 'relative flex shrink-0'

      return {
        base,
        all: base,
      } as const
    },

    rowHeaderClass() {
      const base = 'relative flex overflow-auto shrink-0 hide-scrollbar'
      const border = 'border-b border-light-8 dark:border-dark-6'
      const bg = 'bg-slate-100 dark:bg-dark-950'

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
      const base = 'relative flex flex-col m-2 overflow-auto'
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

      return {
        base,
        subtotal,
        grandTotal,
        border,
        alternate,
        hovered,
        bg,
        all: `${base} ${subtotal} ${grandTotal} ${bg} ${border} ${alternate} ${hovered}`,
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
      const bg = 'bg-slate-100 dark:bg-dark-950'

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

      return {
        base,
        total,
        grandTotal,
        border,
        all: `${base} ${total} ${grandTotal} ${border}`,
      } as const
    },

    valuesScrollerClass() {
      const base = 'grow overflow-x-scroll!'

      return {
        base,
        all: base,
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
  },
}

// @unocss-include

export const PIVOT_DEFAULT_PROPS = {
  ui: {
    topClass() {
      const base = 'flex shrink-0 items-center p-x-1 bg-white dark:bg-true-gray-900 color-true-gray-700 dark:color-true-gray-200 border-b border-true-gray-200 dark:border-true-gray-800'

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
      const base = 'flex gap-2 items-center border-r border-true-gray-200 dark:border-true-gray-800 p-r-2'

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
      const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
      const bg = 'bg-white dark:bg-true-gray-900'

      return {
        base,
        border,
        bg,
        all: `${base} ${border} ${bg}`,
      } as const
    },

    rowHeaderCellClass() {
      const base = 'font-rem-12 font-medium leading-tight color-true-gray-500 dark:color-true-gray-300 shrink-0 min-w-10 min-h-9 flex items-center p-x-2 p-y-1'
      const border = 'border-r border-true-gray-200 dark:border-true-gray-800'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    containerClass() {
      const base = 'relative flex flex-col grow overflow-auto'
      const border = 'border-t border-l border-true-gray-200 dark:border-true-gray-800'

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
      const subtotal = '[&.is-subtotal]:(font-semibold)'
      const grandTotal = '[&.is-grand-total]:(font-semibold border-t-1 border-t-true-gray-300 dark:border-t-true-gray-700 bg-white dark:bg-true-gray-900)'
      const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
      const bg = 'bg-white dark:bg-darker'
      const alternate = ''
      const hovered = '[&.is-hovered]:(!bg-true-gray-50 !dark:bg-true-gray-900)'
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
      const base = 'font-rem-13 shrink-0 min-w-10 flex items-center gap-2 p-x-2 p-y-1'
      const border = 'border-r border-true-gray-200 dark:border-true-gray-800'
      const collapsible = '[&.is-collapsible]:(p-l-1)'
      const total = '[&.is-total]:(font-semibold)'
      const grandTotal = '[&.is-grand-total]:(font-semibold border-t-1 border-t-true-gray-300 dark:border-t-true-gray-700 bg-white dark:bg-true-gray-900)'

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
      const bg = 'bg-white dark:bg-true-gray-900'

      return {
        base,
        bg,
        all: `${base} ${bg}`,
      } as const
    },

    valueHeaderCellClass() {
      const base = 'font-rem-12 font-medium leading-tight color-true-gray-500 dark:color-true-gray-300 shrink-0 min-w-10 min-h-9 flex items-center gap-2 p-x-2 p-y-1'
      const border = 'border-r border-b border-true-gray-200 dark:border-true-gray-800'
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
      const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
      const subtotal = '[&.is-subtotal]:(font-semibold)'
      const grandTotal = '[&.is-grand-total]:(font-semibold border-t-1 border-t-true-gray-300 dark:border-t-true-gray-700 bg-white dark:bg-true-gray-900)'
      const bg = 'bg-white dark:bg-darker'
      const alternate = ''
      const hovered = '[&.is-hovered]:(!bg-true-gray-50 !dark:bg-true-gray-900)'

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
      const base = 'font-rem-13 tabular-nums shrink-0 min-w-10 flex items-center justify-end p-x-2 p-y-1'
      const border = 'border-r border-true-gray-200 dark:border-true-gray-800'
      const total = '[&.is-total]:(font-semibold)'
      const grandTotal = '[&.is-grand-total]:(font-semibold border-t-1 border-t-true-gray-300 dark:border-t-true-gray-700 bg-white dark:bg-true-gray-900)'
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
      // (the cells draw the line between the row labels and the values: a scroller's own line ran on below the last row)
      const base = 'grow overflow-x-scroll!'
      const border = ''

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

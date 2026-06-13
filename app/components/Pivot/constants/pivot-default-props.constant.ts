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
      const base = 'relative flex overflow-auto shrink-0 border-b border-ca hide-scrollbar'

      return {
        base,
        all: base,
      } as const
    },

    rowHeaderCellClass() {
      const base = 'font-rem-12 font-bold shrink-0 min-w-10 flex items-end p-x-2 p-y-1 border-r border-ca'

      return {
        base,
        all: base,
      } as const
    },

    containerClass() {
      const base = 'relative flex flex-col m-2 border-t border-l overflow-auto'

      return {
        base,
        all: base,
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
      const base = 'flex border-b'
      const subtotal = '[&.is-subtotal]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'

      return {
        base,
        subtotal,
        grandTotal,
        all: `${base} ${subtotal} ${grandTotal}`,
      } as const
    },

    rowItemCellClass() {
      const base = 'font-rem-12 shrink-0 min-w-10 flex items-center gap-2 p-x-2 p-y-1 border-r border-ca'
      const collapsible = '[&.is-collapsible]:(p-l-1)'
      const total = '[&.is-total]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'

      return {
        base,
        collapsible,
        total,
        grandTotal,
        all: `${base} ${collapsible} ${total} ${grandTotal}`,
      } as const
    },

    valueHeaderClass() {
      const base = 'grow min-w-0 overflow-hidden p-r-$scrollbarWidth'

      return {
        base,
        all: base,
      } as const
    },

    valueHeaderCellClass() {
      const base = 'font-rem-12 font-bold shrink-0 min-w-10 flex items-center p-x-2 p-y-1 border-r border-b border-ca'

      return {
        base,
        all: base,
      } as const
    },

    valueItemClass() {
      const base = 'flex border-b'
      const subtotal = '[&.is-subtotal]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'

      return {
        base,
        subtotal,
        grandTotal,
        all: `${base} ${subtotal} ${grandTotal}`,
      } as const
    },

    valueItemCellClass() {
      const base = 'font-rem-12 shrink-0 min-w-10 flex items-center justify-end p-x-2 p-y-1 border-r border-ca'
      const total = '[&.is-total]:(font-bold)'
      const grandTotal = '[&.is-grand-total]:(font-bold)'

      return {
        base,
        total,
        grandTotal,
        all: `${base} ${total} ${grandTotal}`,
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

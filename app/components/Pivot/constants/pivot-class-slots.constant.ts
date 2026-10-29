// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const PIVOT_CLASS_SLOTS = {
  topClass() {
    const base = 'flex shrink-0 items-center p-x-2 p-y-1'

    return {
      base,
    } as const
  },

  headerClass() {
    const base = 'relative flex shrink-0'

    return {
      base,
    } as const
  },

  titleClass() {
    const base = 'flex items-center gap-2 font-rem-18 font-bold p-x-2 p-y-1 min-w-70'

    return {
      base,
    } as const
  },

  columnFiltersClass() {
    const base = 'flex gap-2 items-center border-r border-true-gray-200 dark:border-true-gray-800 p-r-2'

    return {
      base,
    } as const
  },

  filtersClass() {
    const base = 'flex gap-2 items-center'

    return {
      base,
    } as const
  },

  rowHeaderClass() {
    const base = 'relative flex overflow-auto shrink-0 hide-scrollbar'
    const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
    const bg = ''

    return {
      base,
      border,
      bg,
    } as const
  },

  rowHeaderCellClass() {
    const base = 'font-rem-12 font-medium leading-tight shrink-0 min-w-10 min-h-9 flex items-center p-x-2 p-y-1'
    const border = 'border-r border-true-gray-200 dark:border-true-gray-800'

    return {
      base,
      border,
    } as const
  },

  containerClass() {
    const base = 'relative flex flex-col grow overflow-auto'
    const border = 'border-t border-l border-true-gray-200 dark:border-true-gray-800'

    return {
      base,
      border,
    } as const
  },

  contentClass() {
    const base = 'flex overflow-auto grow'

    return {
      base,
    } as const
  },

  rowItemClass() {
    const base = 'flex'
    const subtotal = '[&.is-subtotal]:(font-semibold)'
    const grandTotal = '[&.is-grand-total]:(font-semibold)'
    const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
    const bg = ''
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
    } as const
  },

  rowItemCellClass() {
    const base = 'font-rem-13 shrink-0 min-w-10 flex items-center gap-2 p-x-2 p-y-1'
    const border = 'border-r border-true-gray-200 dark:border-true-gray-800'
    const collapsible = '[&.is-collapsible]:(p-l-1)'
    const total = '[&.is-total]:(font-semibold)'
    const grandTotal = '[&.is-grand-total]:(font-semibold)'

    return {
      base,
      collapsible,
      total,
      grandTotal,
      border,
    } as const
  },

  valueHeaderClass() {
    const base = 'grow min-w-0 overflow-hidden p-r-$scrollbarWidth'
    const bg = ''

    return {
      base,
      bg,
    } as const
  },

  valueHeaderCellClass() {
    const base = 'font-rem-12 font-medium leading-tight shrink-0 min-w-10 min-h-9 flex items-center justify-end text-right gap-2 p-x-2 p-y-1'
    const border = 'border-r border-b border-true-gray-200 dark:border-true-gray-800'
    const collapsible = '[&.is-collapsible]:(p-l-1)'

    return {
      base,
      collapsible,
      border,
    } as const
  },

  valueItemClass() {
    const base = 'flex'
    const border = 'border-b border-true-gray-200 dark:border-true-gray-800'
    const subtotal = '[&.is-subtotal]:(font-semibold)'
    const grandTotal = '[&.is-grand-total]:(font-semibold)'
    const bg = ''
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
    } as const
  },

  valueItemCellClass() {
    const base = 'font-rem-13 tabular-nums shrink-0 min-w-10 flex items-center justify-end p-x-2 p-y-1'
    const border = 'border-r border-true-gray-200 dark:border-true-gray-800'
    const total = '[&.is-total]:(font-semibold)'
    const grandTotal = '[&.is-grand-total]:(font-semibold)'
    const clickable = '[&.is-clickable]:(cursor-pointer) [&.is-clickable:focus-visible]:(outline-2 outline-primary outline-solid outline-offset--2)'

    return {
      base,
      total,
      grandTotal,
      clickable,
      border,
    } as const
  },

  valuesScrollerClass() {
    // (the cells draw the line between the row labels and the values: a scroller's own line ran on below the last row)
    const base = 'grow overflow-x-scroll!'
    const border = ''

    return {
      base,
      border,
    } as const
  },

  rowsScrollerClass() {
    const base = 'hide-scrollbar'

    return {
      base,
    } as const
  },

  rowsWrapperClass() {
    const base = 'flex flex-col shrink-0 overflow-x-scroll'

    return {
      base,
    } as const
  },

  loadingClass() {
    const base = 'flex flex-center p-y-3 absolute inset-0 bg-white/68 dark:bg-dark-950/87 backdrop-blur-sm'

    return {
      base,
    } as const
  },
}

type PivotSlots<K extends keyof typeof PIVOT_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof PIVOT_CLASS_SLOTS[K]>>

export const PIVOT_CLASS_COMPOSERS = {
  topClass(slots: PivotSlots<'topClass'>) {
    return slots.base
  },

  headerClass(slots: PivotSlots<'headerClass'>) {
    return slots.base
  },

  titleClass(slots: PivotSlots<'titleClass'>) {
    return slots.base
  },

  columnFiltersClass(slots: PivotSlots<'columnFiltersClass'>) {
    return slots.base
  },

  filtersClass(slots: PivotSlots<'filtersClass'>) {
    return slots.base
  },

  rowHeaderClass(slots: PivotSlots<'rowHeaderClass'>) {
    return `${slots.base} ${slots.border} ${slots.bg}`
  },

  rowHeaderCellClass(slots: PivotSlots<'rowHeaderCellClass'>) {
    return `${slots.base} ${slots.border}`
  },

  containerClass(slots: PivotSlots<'containerClass'>) {
    return `${slots.base} ${slots.border}`
  },

  contentClass(slots: PivotSlots<'contentClass'>) {
    return slots.base
  },

  rowItemClass(slots: PivotSlots<'rowItemClass'>) {
    return `${slots.base} ${slots.subtotal} ${slots.grandTotal} ${slots.bg} ${slots.border} ${slots.alternate} ${slots.hovered} ${slots.clickable}`
  },

  rowItemCellClass(slots: PivotSlots<'rowItemCellClass'>) {
    return `${slots.base} ${slots.collapsible} ${slots.total} ${slots.grandTotal} ${slots.border}`
  },

  valueHeaderClass(slots: PivotSlots<'valueHeaderClass'>) {
    return `${slots.base} ${slots.bg}`
  },

  valueHeaderCellClass(slots: PivotSlots<'valueHeaderCellClass'>) {
    return `${slots.base} ${slots.collapsible} ${slots.border}`
  },

  valueItemClass(slots: PivotSlots<'valueItemClass'>) {
    return `${slots.base} ${slots.subtotal} ${slots.grandTotal} ${slots.bg} ${slots.border} ${slots.alternate} ${slots.hovered}`
  },

  valueItemCellClass(slots: PivotSlots<'valueItemCellClass'>) {
    return `${slots.base} ${slots.total} ${slots.grandTotal} ${slots.border} ${slots.clickable}`
  },

  valuesScrollerClass(slots: PivotSlots<'valuesScrollerClass'>) {
    return `${slots.base} ${slots.border}`
  },

  rowsScrollerClass(slots: PivotSlots<'rowsScrollerClass'>) {
    return slots.base
  },

  rowsWrapperClass(slots: PivotSlots<'rowsWrapperClass'>) {
    return slots.base
  },

  loadingClass(slots: PivotSlots<'loadingClass'>) {
    return slots.base
  },
}

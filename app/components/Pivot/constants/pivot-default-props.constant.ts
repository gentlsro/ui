import { PIVOT_CLASS_COMPOSERS, PIVOT_CLASS_SLOTS } from './pivot-class-slots.constant'

// @unocss-include

export const PIVOT_DEFAULT_PROPS = {
  ui: {
    topClass() {
      const slots = PIVOT_CLASS_SLOTS.topClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.topClass(slots) } as const)
    },

    headerClass() {
      const slots = PIVOT_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    titleClass() {
      const slots = PIVOT_CLASS_SLOTS.titleClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.titleClass(slots) } as const)
    },

    columnFiltersClass() {
      const slots = PIVOT_CLASS_SLOTS.columnFiltersClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.columnFiltersClass(slots) } as const)
    },

    filtersClass() {
      const slots = PIVOT_CLASS_SLOTS.filtersClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.filtersClass(slots) } as const)
    },

    rowHeaderClass() {
      const slots = PIVOT_CLASS_SLOTS.rowHeaderClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowHeaderClass(slots) } as const)
    },

    rowHeaderCellClass() {
      const slots = PIVOT_CLASS_SLOTS.rowHeaderCellClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowHeaderCellClass(slots) } as const)
    },

    containerClass() {
      const slots = PIVOT_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = PIVOT_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    rowItemClass() {
      const slots = PIVOT_CLASS_SLOTS.rowItemClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowItemClass(slots) } as const)
    },

    rowItemCellClass() {
      const slots = PIVOT_CLASS_SLOTS.rowItemCellClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowItemCellClass(slots) } as const)
    },

    valueHeaderClass() {
      const slots = PIVOT_CLASS_SLOTS.valueHeaderClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.valueHeaderClass(slots) } as const)
    },

    valueHeaderCellClass() {
      const slots = PIVOT_CLASS_SLOTS.valueHeaderCellClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.valueHeaderCellClass(slots) } as const)
    },

    valueItemClass() {
      const slots = PIVOT_CLASS_SLOTS.valueItemClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.valueItemClass(slots) } as const)
    },

    valueItemCellClass() {
      const slots = PIVOT_CLASS_SLOTS.valueItemCellClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.valueItemCellClass(slots) } as const)
    },

    valuesScrollerClass() {
      const slots = PIVOT_CLASS_SLOTS.valuesScrollerClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.valuesScrollerClass(slots) } as const)
    },

    rowsScrollerClass() {
      const slots = PIVOT_CLASS_SLOTS.rowsScrollerClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowsScrollerClass(slots) } as const)
    },

    rowsWrapperClass() {
      const slots = PIVOT_CLASS_SLOTS.rowsWrapperClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.rowsWrapperClass(slots) } as const)
    },

    loadingClass() {
      const slots = PIVOT_CLASS_SLOTS.loadingClass()

      return withClassPicker({ ...slots, all: PIVOT_CLASS_COMPOSERS.loadingClass(slots) } as const)
    },
  },
}

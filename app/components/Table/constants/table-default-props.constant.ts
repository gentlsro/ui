import { TABLE_CLASS_COMPOSERS, TABLE_CLASS_SLOTS } from './table-class-slots.constant'

// @unocss-include

export const TABLE_DEFAULT_PROPS = {
  ui: {
    alternateRowClass() {
      const slots = TABLE_CLASS_SLOTS.alternateRowClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.alternateRowClass(slots) } as const)
    },

    headerCellClass() {
      const slots = TABLE_CLASS_SLOTS.headerCellClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.headerCellClass(slots) } as const)
    },

    headerCellInnerClass() {
      const slots = TABLE_CLASS_SLOTS.headerCellInnerClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.headerCellInnerClass(slots) } as const)
    },

    rowClass() {
      const slots = TABLE_CLASS_SLOTS.rowClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.rowClass(slots) } as const)
    },

    rowActionsClass() {
      const slots = TABLE_CLASS_SLOTS.rowActionsClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.rowActionsClass(slots) } as const)
    },

    rowActionsHeaderClass() {
      const slots = TABLE_CLASS_SLOTS.rowActionsHeaderClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.rowActionsHeaderClass(slots) } as const)
    },

    cellClass() {
      const slots = TABLE_CLASS_SLOTS.cellClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.cellClass(slots) } as const)
    },

    cellInnerClass() {
      const slots = TABLE_CLASS_SLOTS.cellInnerClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.cellInnerClass(slots) } as const)
    },

    contentClass() {
      const slots = TABLE_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    headerClass() {
      const slots = TABLE_CLASS_SLOTS.headerClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.headerClass(slots) } as const)
    },

    toolbarClass() {
      const slots = TABLE_CLASS_SLOTS.toolbarClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.toolbarClass(slots) } as const)
    },

    topClass() {
      const slots = TABLE_CLASS_SLOTS.topClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.topClass(slots) } as const)
    },

    bottomClass() {
      const slots = TABLE_CLASS_SLOTS.bottomClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.bottomClass(slots) } as const)
    },

    containerClass() {
      const slots = TABLE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    totalsCellClass() {
      const slots = TABLE_CLASS_SLOTS.totalsCellClass()

      return withClassPicker({ ...slots, all: TABLE_CLASS_COMPOSERS.totalsCellClass(slots) } as const)
    },
  },
} as const

// @unocss-include
import type { IListProps } from '../types/list-props.type'
import { LIST_CLASS_COMPOSERS, LIST_CLASS_SLOTS } from './list-class-slots.constant'

export const LIST_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = LIST_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    searchClass() {
      const slots = LIST_CLASS_SLOTS.searchClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.searchClass(slots) } as const)
    },

    rowClass() {
      const slots = LIST_CLASS_SLOTS.rowClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.rowClass(slots) } as const)
    },

    rowContentClass() {
      const slots = LIST_CLASS_SLOTS.rowContentClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.rowContentClass(slots) } as const)
    },

    rowGroupClass() {
      const slots = LIST_CLASS_SLOTS.rowGroupClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.rowGroupClass(slots) } as const)
    },

    moveHandleClass() {
      const slots = LIST_CLASS_SLOTS.moveHandleClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.moveHandleClass(slots) } as const)
    },

    moveHandleIconClass() {
      const slots = LIST_CLASS_SLOTS.moveHandleIconClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.moveHandleIconClass(slots) } as const)
    },

    loadingClass() {
      const slots = LIST_CLASS_SLOTS.loadingClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.loadingClass(slots) } as const)
    },

    contentClass(payload: Parameters<typeof LIST_CLASS_SLOTS.contentClass>[0]) {
      const slots = LIST_CLASS_SLOTS.contentClass(payload)

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.contentClass(slots, payload) } as const)
    },

    noDataClass() {
      const slots = LIST_CLASS_SLOTS.noDataClass()

      return withClassPicker({ ...slots, all: LIST_CLASS_COMPOSERS.noDataClass(slots) } as const)
    },

  },
} satisfies IListProps

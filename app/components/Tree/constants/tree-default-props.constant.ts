// @unocss-include

// Types
import type { ITreeProps } from '../types/tree-props.type'
import { TREE_CLASS_COMPOSERS, TREE_CLASS_SLOTS } from './tree-class-slots.constant'

export const TREE_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = TREE_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    contentClass() {
      const slots = TREE_CLASS_SLOTS.contentClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.contentClass(slots) } as const)
    },

    nodeClass() {
      const slots = TREE_CLASS_SLOTS.nodeClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.nodeClass(slots) } as const)
    },

    nodeContentClass() {
      const slots = TREE_CLASS_SLOTS.nodeContentClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.nodeContentClass(slots) } as const)
    },

    noDataClass() {
      const slots = TREE_CLASS_SLOTS.noDataClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.noDataClass(slots) } as const)
    },

    actionsClass() {
      const slots = TREE_CLASS_SLOTS.actionsClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.actionsClass(slots) } as const)
    },

    searchClass() {
      const slots = TREE_CLASS_SLOTS.searchClass()

      return withClassPicker({ ...slots, all: TREE_CLASS_COMPOSERS.searchClass(slots) } as const)
    },
  },
} satisfies ITreeProps

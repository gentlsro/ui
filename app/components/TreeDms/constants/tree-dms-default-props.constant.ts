// @unocss-include

import type { ITreeDmsProps } from '../types/tree-dms-props.type'
import { TREE_DMS_CLASS_COMPOSERS, TREE_DMS_CLASS_SLOTS } from './tree-dms-class-slots.constant'

export const TREE_DMS_DEFAULT_PROPS = {
  ui: {
    labelClass() {
      const slots = TREE_DMS_CLASS_SLOTS.labelClass()

      return withClassPicker({ ...slots, all: TREE_DMS_CLASS_COMPOSERS.labelClass(slots) } as const)
    },
  },
} satisfies Pick<ITreeDmsProps<any>, 'ui'>

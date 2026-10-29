// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const TREE_DMS_CLASS_SLOTS = {
  labelClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type TreeDmsSlots<K extends keyof typeof TREE_DMS_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof TREE_DMS_CLASS_SLOTS[K]>>

export const TREE_DMS_CLASS_COMPOSERS = {
  labelClass(slots: TreeDmsSlots<'labelClass'>) {
    return `${slots.base}`
  },
}

// @unocss-include

import type { ITreeDmsProps } from '../types/tree-dms-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

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

export const TREE_DMS_DEFAULT_PROPS = {
  ui: createUIClassResolver('treeDms', {
    slots: TREE_DMS_CLASS_SLOTS,
    compose: TREE_DMS_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies Pick<ITreeDmsProps<any>, 'ui'>

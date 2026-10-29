// @unocss-include

import type { IVirtualScrollerVerticalProps } from '../types/virtual-scroller-vertical-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS = {
  rowClass() {
    const base = ''

    return {
      base,
    } as const
  },
}

type VirtualScrollerVerticalSlots<K extends keyof typeof VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS[K]>>

export const VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS = {
  rowClass(slots: VirtualScrollerVerticalSlots<'rowClass'>) {
    return `${slots.base}`
  },
}

export const VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS = {
  ui: createUIClassResolver('virtualScrollerVertical', {
    slots: VIRTUAL_SCROLLER_VERTICAL_CLASS_SLOTS,
    compose: VIRTUAL_SCROLLER_VERTICAL_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies Omit<IVirtualScrollerVerticalProps<any>, 'rows'>

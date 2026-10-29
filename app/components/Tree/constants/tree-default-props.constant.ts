// @unocss-include

import type { ITreeProps } from '../types/tree-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const TREE_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative p-1'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'p-y-2.5 grow min-h-12'

    return {
      base,
    } as const
  },

  nodeClass() {
    const base = 'flex items-center gap-1 p-x-1 rounded-custom overflow-auto w-full m-b-px'

    // Hover
    const hover = 'hover:bg-slate-100 dark:hover:bg-slate-800'

    // Focus
    const focus = '[&.is-focused]:(bg-slate-100 dark:bg-slate-800)'

    // Hovered
    const hovered = '[&.is-hovered]:(bg-slate-100 dark:bg-slate-800)'

    // Selection - single
    const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

    // Selection - multi (with checkbox)
    const selectionMultiCheckbox = ''

    // Focus while selected
    const focusSelected = '[&.is-focused.is-selected:not(.uses-checkbox)]:(outline-1 outline-dashed outline-offset--1 outline-primary dark:(outline-blue-400))'

    return {
      base,
      hover,
      hovered,
      selectionNoCheckbox,
      selectionMultiCheckbox,
      focus,
      focusSelected,
    } as const
  },

  nodeContentClass() {
    const base = 'overflow-hidden flex flex-col grow leading-20px p-y-1.5'

    // Hover
    const hover = '[.node:hover_&]:bg-slate-100 dark:([.node:hover_&]:bg-slate-800)'

    // Collapsible
    const collapsible = '[.node.is-padded_&]:m-l-28px'

    return {
      base,
      hover,
      collapsible,
    } as const
  },

  noDataClass() {
    const base = 'absolute left-0 top-0 p-x-3 p-y-2 color-ca font-rem-14'

    return {
      base,
    } as const
  },

  actionsClass() {
    // Beside the search, which gives way first: the buttons keep their size
    const base = 'flex gap-1 items-center shrink-0'

    return {
      base,
    } as const
  },

  searchClass() {
    const base = 'flex'

    return {
      base,
    } as const
  },
}

type TreeSlots<K extends keyof typeof TREE_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof TREE_CLASS_SLOTS[K]>>

export const TREE_CLASS_COMPOSERS = {
  containerClass(slots: TreeSlots<'containerClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: TreeSlots<'contentClass'>) {
    return `${slots.base}`
  },

  nodeClass(slots: TreeSlots<'nodeClass'>) {
    return `${slots.base} ${slots.hover} ${slots.focus} ${slots.hovered} ${slots.selectionNoCheckbox} ${slots.selectionMultiCheckbox} ${slots.focusSelected}`
  },

  nodeContentClass(slots: TreeSlots<'nodeContentClass'>) {
    return `${slots.base} ${slots.hover} ${slots.collapsible}`
  },

  noDataClass(slots: TreeSlots<'noDataClass'>) {
    return `${slots.base}`
  },

  actionsClass(slots: TreeSlots<'actionsClass'>) {
    return `${slots.base}`
  },

  searchClass(slots: TreeSlots<'searchClass'>) {
    return `${slots.base}`
  },
}

export const TREE_DEFAULT_PROPS = {
  ui: createUIClassResolver('tree', {
    slots: TREE_CLASS_SLOTS,
    compose: TREE_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies ITreeProps

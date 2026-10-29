// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'

export const LIST_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col overflow-auto rounded-custom'

    return {
      base,
    } as const
  },

  searchClass() {
    const base = 'flex flex-col gap-1 p-2'

    return {
      base,
    } as const
  },

  rowClass() {
    const base = 'gap-1 p-r-2 rounded-custom truncate font-rem-14 m-b-px w-full cursor-default'
    const row = 'flex w-full items-center'
    const col = 'flex flex-col'

    // Checkbox
    const checkbox = '[&.uses-checkbox]:(flex items-center)'

    // Focus
    const focus = '[&.is-focused]:(bg-slate-100 dark:bg-slate-800)'

    // Selection - single
    const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

    // Selection - multi (with checkbox)
    const selectionMultiCheckbox = ''

    // Focus while selected
    const focusSelected = '[&.is-focused.is-selected:not(.uses-checkbox)]:(outline-1 outline-dashed outline-offset--1 outline-primary dark:(outline-blue-400))'

    return {
      base,
      checkbox,
      selectionNoCheckbox,
      selectionMultiCheckbox,
      focus,
      focusSelected,
      row,
      col,
    } as const
  },

  rowContentClass() {
    const base = 'overflow-auto flex flex-col gap-1 grow p-y-1.5 leading-20px'

    return {
      base,
    } as const
  },

  rowGroupClass() {
    const base = 'relative flex gap-x-2 cursor-default select-none p-r-1 min-h-8 w-full'
    const text = 'capitalize color-true-gray text-sm items-end p-b-0.5'

    return {
      base,
      text,
    } as const
  },

  moveHandleClass() {
    const base = 'flex flex-center shrink-0 touch-none cursor-grab self-start p-t-2 p-r-1 m-t-2px color-ca'

    return {
      base,
    } as const
  },

  moveHandleIconClass() {
    const base = 'i-akar-icons:drag-vertical color-ca w-4 h-4 cursor-move'

    return {
      base,
    } as const
  },

  loadingClass() {
    const base = 'flex flex-center p-y-3'

    return {
      base,
    } as const
  },

  contentClass(payload: { hasSearch?: boolean }) {
    const { hasSearch } = payload
    const base = hasSearch ? 'p-x-2' : 'p-2'

    return {
      base,
    } as const
  },

  noDataClass() {
    const base = 'p-x-3 p-t-2 p-b-4 color-ca font-rem-12'

    return {
      base,
    } as const
  },
}

type ListSlots<K extends keyof typeof LIST_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof LIST_CLASS_SLOTS[K]>>

export const LIST_CLASS_COMPOSERS = {
  containerClass(slots: ListSlots<'containerClass'>) {
    return `${slots.base}`
  },

  searchClass(slots: ListSlots<'searchClass'>) {
    return `${slots.base}`
  },

  rowClass(slots: ListSlots<'rowClass'>) {
    return `${slots.base} ${slots.focus} ${slots.selectionNoCheckbox} ${slots.selectionMultiCheckbox} ${slots.focusSelected} ${slots.row}`
  },

  rowContentClass(slots: ListSlots<'rowContentClass'>) {
    return `${slots.base}`
  },

  rowGroupClass(slots: ListSlots<'rowGroupClass'>) {
    return `${slots.base} ${slots.text}`
  },

  moveHandleClass(slots: ListSlots<'moveHandleClass'>) {
    return `${slots.base}`
  },

  moveHandleIconClass(slots: ListSlots<'moveHandleIconClass'>) {
    return `${slots.base}`
  },

  loadingClass(slots: ListSlots<'loadingClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: ListSlots<'contentClass'>, _payload: { hasSearch?: boolean }) {
    return `${slots.base}`
  },

  noDataClass(slots: ListSlots<'noDataClass'>) {
    return `${slots.base}`
  },
}

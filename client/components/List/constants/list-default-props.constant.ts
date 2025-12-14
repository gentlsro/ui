// @unocss-include
import type { IListProps } from '../types/list-props.type'

export const LIST_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col overflow-auto rounded-custom'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    searchClass() {
      const base = 'flex flex-col gap-1 p-2'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    rowClass() {
      const base = 'w-full flex gap-1 p-r-2 items-center rounded-custom overflow-auto font-rem-14'

      // Focus
      const focus = '[&.is-focused]:(bg-slate-100 dark:bg-slate-800)'

      // Selection - single
      const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

      // Selection - multi (with checkbox)
      const selectionMultiCheckbox = '[&.is-selected.is-multi.uses-checkbox]:())'

      // Focus while selected
      const focusSelected = '[&.is-focused.is-selected:not(.uses-checkbox)]:(outline-1 outline-dashed outline-offset--1 outline-primary dark:(outline-blue-400))'

      return {
        base,
        selectionNoCheckbox,
        selectionMultiCheckbox,
        focus,
        focusSelected,
        '*': `${base} ${focus} ${selectionNoCheckbox} ${selectionMultiCheckbox} ${focusSelected}`,
      } as const
    },

    rowContentClass() {
      const base = 'overflow-auto flex flex-col gap-1 grow p-y-1.5 leading-20px'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    rowGroupClass() {
      const base = 'relative flex gap-x-2 cursor-default select-none items-center p-r-1 min-h-8 w-full'
      const text = 'capitalize color-true-gray text-sm items-end p-b-0.5'

      return {
        base,
        text,
        '*': `${base} ${text}`,
      } as const
    },

    moveHandleClass() {
      const base = 'flex flex-center shrink-0 touch-none cursor-grab self-start p-t-2 p-r-1 m-t-2px color-ca'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    moveHandleIconClass() {
      const base = 'i-akar-icons:drag-vertical color-ca w-4 h-4 cursor-move'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    loadingClass() {
      const base = 'flex flex-center p-y-3'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    contentClass(payload: { hasSearch?: boolean }) {
      const { hasSearch } = payload
      const base = hasSearch ? 'p-x-2' : 'p-2'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    noDataClass() {
      const base = 'p-b-2'

      return {
        base,
        '*': `${base}`,
      } as const
    },

  },
} satisfies IListProps

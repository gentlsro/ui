// @unocss-include
import type { IListProps } from '../types/list-props.type'

function p<T>(keys: (keyof T)[], value: T) {
  return keys.reduce((agg, key) => {
    agg[key] = value[key]

    return agg
  }, {} as Record<keyof T, any>)
}

export const LIST_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col overflow-auto rounded-custom'

      return {
        base,
        all: `${base}`,
      } as const
    },

    searchClass() {
      const base = 'flex flex-col gap-1 p-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    rowClass() {
      const base = 'gap-1 p-r-2 rounded-custom truncate font-rem-14 m-b-px w-full'
      const row = 'flex w-full items-center'
      const col = 'flex flex-col'

      // Checkbox
      const checkbox = '[&.uses-checkbox]:(flex items-center)'

      // Focus
      const focus = '[&.is-focused]:(bg-slate-100 dark:bg-slate-800)'

      // Selection - single
      const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

      // Selection - multi (with checkbox)
      const selectionMultiCheckbox = '[&.is-selected.is-multi.uses-checkbox]:())'

      // Focus while selected
      const focusSelected = '[&.is-focused.is-selected:not(.uses-checkbox)]:(outline-1 outline-dashed outline-offset--1 outline-primary dark:(outline-blue-400))'

      const classes = {
        base,
        checkbox,
        selectionNoCheckbox,
        selectionMultiCheckbox,
        focus,
        focusSelected,
        row,
        col,
        all: `${base} ${focus} ${selectionNoCheckbox} ${selectionMultiCheckbox} ${focusSelected} ${row}`,
      } as const

      return Object.assign(classes, {
        p: (...keys: (keyof typeof classes)[]) => keys.map(k => classes[k]).join(' '),
      })
    },

    rowContentClass() {
      const base = 'overflow-auto flex flex-col gap-1 grow p-y-1.5 leading-20px'

      return {
        base,
        all: `${base}`,
      } as const
    },

    rowGroupClass() {
      const base = 'relative flex gap-x-2 cursor-default select-none items-center p-r-1 min-h-8 w-full'
      const text = 'capitalize color-true-gray text-sm items-end p-b-0.5'

      return {
        base,
        text,
        all: `${base} ${text}`,
      } as const
    },

    moveHandleClass() {
      const base = 'flex flex-center shrink-0 touch-none cursor-grab self-start p-t-2 p-r-1 m-t-2px color-ca'

      return {
        base,
        all: `${base}`,
      } as const
    },

    moveHandleIconClass() {
      const base = 'i-akar-icons:drag-vertical color-ca w-4 h-4 cursor-move'

      return {
        base,
        all: `${base}`,
      } as const
    },

    loadingClass() {
      const base = 'flex flex-center p-y-3'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass(payload: { hasSearch?: boolean }) {
      const { hasSearch } = payload
      const base = hasSearch ? 'p-x-2' : 'p-2'

      return {
        base,
        all: `${base}`,
      } as const
    },

    noDataClass() {
      const base = 'p-x-3 p-t-2 p-b-4 color-ca font-rem-14'

      return {
        base,
        all: `${base}`,
      } as const
    },

  },
} satisfies IListProps

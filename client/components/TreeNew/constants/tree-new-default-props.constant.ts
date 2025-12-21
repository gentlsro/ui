// @unocss-include

// Types
import type { ITreeProps } from '../types/tree-props.new.type'

export const TREE_NEW_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'p-1'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    contentClass() {
      const base = 'p-y-2.5'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    nodeClass() {
      const base = 'flex items-center gap-1 p-x-1 rounded-custom overflow-auto w-full'

      // Hover
      const hover = 'hover:bg-slate-100 dark:hover:bg-slate-800'

      // Focus
      const focus = '[&.is-focused]:(bg-slate-100 dark:bg-slate-800)'

      // Hovered
      const hovered = '[&.is-hovered]:(bg-slate-100 dark:bg-slate-800)'

      // Selection - single
      const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

      // Selection - multi (with checkbox)
      const selectionMultiCheckbox = '[&.is-selected.is-multi.uses-checkbox]:())'

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
        '*': `${base} ${hover} ${focus} ${hovered} ${selectionNoCheckbox} ${selectionMultiCheckbox} ${focusSelected}`,
      } as const
    },

    nodeContentClass() {
      const base = 'overflow-hidden flex flex-col grow leading-20px p-y-1.5'

      // Hover
      const hover = 'group-hover/node:bg-slate-100 dark:(group-hover/node:bg-slate-800)'

      // Collapsible
      const collapsible = 'group-[.is-padded]/node:m-l-28px'

      // // Selection - single
      // const selectionNoCheckbox = '[&.is-selected:not(.uses-checkbox)]:(bg-slate-200 color-primary dark:(bg-slate-800 color-blue-400))'

      // // Selection - multi (with checkbox)
      // const selectionMultiCheckbox = '[&.is-selected.is-multi.uses-checkbox]:())'

      // // Focus while selected
      // const focusSelected = '[&.is-focused.is-selected:not(.uses-checkbox)]:(outline-1 outline-dashed outline-offset--1 outline-primary dark:(outline-blue-400))'

      return {
        base,
        hover,
        collapsible,
        '*': `${base} ${hover} ${collapsible}`,
      } as const
    },

    noDataClass() {
      const base = 'p-x-4 p-b-2 color-ca font-rem-14'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    actionsClass() {
      const base = 'flex gap-1 items-center'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    searchClass() {
      const base = 'flex gap-1 items-center'

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies ITreeProps

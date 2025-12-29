// @unocss-include

// Types
import type { ICollapseProps } from '../types/collapse-props.type'

export const COLLAPSE_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: { isOpen: boolean }) {
      const base = 'relative flex flex-col'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    headerClass(payload: { isOpen: boolean }) {
      const base = payload.isOpen
        ? 'flex items-center gap-2 p-2 rounded-custom cursor-pointer rounded-b-0'
        : 'flex items-center gap-2 p-2 rounded-custom cursor-pointer'
      const bg = 'bg-slate-100 dark:bg-dark-950'

      return {
        base,
        bg,
        '*': `${base} ${bg}`,
      } as const
    },

    headerRightClass(payload: { isOpen: boolean }) {
      const base = 'flex items-center gap-1 items-center self-start shrink-0'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    titleClass(payload: { isOpen: boolean }) {
      const base = 'font-rem-14 font-semibold'
      const color = 'text-slate-900 dark:text-slate-100'

      return {
        base,
        color,
        '*': `${base} ${color}`,
      } as const
    },

    subtitleClass(payload: { isOpen: boolean }) {
      const base = 'text-caption leading-tight font-rem-12'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    expandIconClass(payload: { isOpen: boolean }) {
      const base = 'i-majesticons:chevron-right'
      const rotation = payload.isOpen ? 'rotate-90deg' : ''

      return {
        base,
        rotation,
        '*': `${base} ${rotation}`,
      } as const
    },

    textClass(payload: { isOpen: boolean }) {
      const base = 'flex flex-col grow'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    contentClass(payload: { isOpen: boolean }) {
      const base = 'flex flex-col overflow-auto rounded-b-custom p-2'
      const bg = 'bg-white dark:bg-dark-950'
      const border = 'border-t-1 border-ca'
      const floating = '[&.is-floating]:(absolute z-11 left-0 right-0 bottom-0 translate-y-full)'

      return {
        base,
        bg,
        floating,
        border,
        '*': `${base} ${bg} ${floating} ${border}`,
      } as const
    },
  },
} satisfies ICollapseProps

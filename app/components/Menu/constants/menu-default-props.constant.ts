// @unocss-include

import type { IMenuProps } from '../types/menu-props.type'
import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const MENU_CLASS_SLOTS = {
  menuClass() {
    const base = 'flex flex-col grow rounded-custom'
    const background = 'dark:bg-dark-950/90 bg-white/90 backdrop-blur-2px'
    const border = 'rounded-custom border-1 border-slate-300 dark:border-dark-700'
    const limits = 'max-w-95vw max-h-95%'
    const shadow = 'light:(shadow-consistent-xs shadow-darker/12)'

    return {
      base,
      background,
      border,
      limits,
      shadow,
    } as const
  },

  contentClass() {
    const base = 'relative flex flex-col grow overflow-auto rounded-custom max-h-inherit'
    const dense = '[&.is-dense]:p-0'
    const padding = 'p-1'
    const gap = 'gap-1'

    return {
      base,
      dense,
      padding,
      gap,
    } as const
  },

  headerClass() {
    const base = 'flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom'
    const font = 'font-semibold'
    const movable = '[&.is-movable]:cursor-move'

    return {
      base,
      font,
      movable,
    } as const
  },

  titleClass() {
    const base = 'grow'

    return {
      base,
    } as const
  },

  overlayClass() {
    const base = 'fixed inset-0 transition-background-color ease bg-transparent'
    const active = '[&.is-active]:(bg-darker/70)'

    return {
      base,
      active,
    } as const
  },
}

type MenuSlots<K extends keyof typeof MENU_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof MENU_CLASS_SLOTS[K]>>

export const MENU_CLASS_COMPOSERS = {
  menuClass(slots: MenuSlots<'menuClass'>) {
    return `${slots.base} ${slots.background} ${slots.border} ${slots.limits} ${slots.shadow}`
  },

  contentClass(slots: MenuSlots<'contentClass'>) {
    return `${slots.base} ${slots.dense} ${slots.padding} ${slots.gap}`
  },

  headerClass(slots: MenuSlots<'headerClass'>) {
    return `${slots.base} ${slots.font} ${slots.movable}`
  },

  titleClass(slots: MenuSlots<'titleClass'>) {
    return `${slots.base}`
  },

  overlayClass(slots: MenuSlots<'overlayClass'>) {
    return `${slots.base} ${slots.active}`
  },
}

export const MENU_DEFAULT_PROPS = {
  ui: createUIClassResolver('menu', {
    slots: MENU_CLASS_SLOTS,
    compose: MENU_CLASS_COMPOSERS,
  }, () => uiClassLayers),
} satisfies IMenuProps

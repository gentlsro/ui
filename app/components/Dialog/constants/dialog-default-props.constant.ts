// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

type DialogPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export const DIALOG_CLASS_SLOTS = {
  backdropClass() {
    const base = 'fixed inset-0 z-$zIndex transition-background-color duration-$transitionDuration ease-out bg-transparent'
    const active = '[&.is-active]:(bg-darker/70)'

    return {
      base,
      active,
    } as const
  },

  wrapperClass() {
    const base = [
      'flex fixed pointer-events-none z-$zIndex',
      'top-[var(--visual-viewport-offset-top,0px)]',
      'left-[var(--visual-viewport-offset-left,0px)]',
      'w-[var(--visual-viewport-width,100%)]',
      'h-[var(--visual-viewport-height,100dvh)]',
    ].join(' ')

    // Variant groups cannot parse this nested attribute selector in UnoCSS 66.10.
    const positionTop = '[&[position="top"]]:justify-center [&[position="top"]]:items-start'
    const positionBottom = '[&[position="bottom"]]:justify-center [&[position="bottom"]]:items-end'
    const positionLeft = '[&[position="left"]]:justify-start [&[position="left"]]:items-center'
    const positionRight = '[&[position="right"]]:justify-end [&[position="right"]]:items-center'
    const positionCenter = '[&[position="center"]]:flex-center'

    return {
      base,
      positionTop,
      positionBottom,
      positionLeft,
      positionRight,
      positionCenter,
    } as const
  },

  dialogClass(_payload: {
    position: DialogPosition
  }) {
    const base = 'max-h-[min(95%,var(--dialogMaxHeight))] max-w-95vw pointer-events-auto flex flex-col dark:bg-black/95 bg-white backdrop-blur-2px rounded-custom overflow-auto'

    const positionCenter = ''
    const positionTop = 'rounded-t-none'
    const positionBottom = 'rounded-b-none'
    const positionLeft = 'rounded-l-none'
    const positionRight = 'rounded-r-none'

    const positions = {
      center: positionCenter,
      top: positionTop,
      bottom: positionBottom,
      left: positionLeft,
      right: positionRight,
    } as const

    const hasTransition = '[&.has-transition]:(transition-all duration-$transitionDuration ease-out)'

    return {
      base,
      positions,
      hasTransition,
    } as const
  },

  headerClass() {
    const base = 'flex items-center gap-2 p-x-4 p-y-3 border-b border-b-truegray-2 dark:border-b-truegray-7 bg-white dark:bg-dark-950'

    return {
      base,
    } as const
  },

  titleClass() {
    const base = 'flex-grow font-semibold text-lg m-0'

    return {
      base,
    } as const
  },

  contentClass() {
    const base = 'flex flex-col flex-grow overflow-auto'
    const padding = 'p-4'
    const dense = '[&.is-dense]:(p-0)'

    return {
      base,
      dense,
      padding,
    } as const
  },
}

type DialogSlots<K extends keyof typeof DIALOG_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof DIALOG_CLASS_SLOTS[K]>>

export const DIALOG_CLASS_COMPOSERS = {
  backdropClass(slots: DialogSlots<'backdropClass'>) {
    return `${slots.base} ${slots.active}`
  },

  wrapperClass(slots: DialogSlots<'wrapperClass'>) {
    return `${slots.base} ${slots.positionTop} ${slots.positionBottom} ${slots.positionLeft} ${slots.positionRight} ${slots.positionCenter}`
  },

  dialogClass(slots: DialogSlots<'dialogClass'>, payload: {
    position: DialogPosition
  }) {
    const { position: positionProp } = payload

    return `${slots.base} ${slots.positions[positionProp]} ${slots.hasTransition}`
  },

  headerClass(slots: DialogSlots<'headerClass'>) {
    return `${slots.base}`
  },

  titleClass(slots: DialogSlots<'titleClass'>) {
    return `${slots.base}`
  },

  contentClass(slots: DialogSlots<'contentClass'>) {
    return `${slots.base} ${slots.dense} ${slots.padding}`
  },
}

export const DIALOG_DEFAULT_PROPS = {
  ui: createUIClassResolver('dialog', {
    slots: DIALOG_CLASS_SLOTS,
    compose: DIALOG_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

// @unocss-include

// Types
import type { DialogPosition, IDialogProps } from '../types/dialog-props.type'

export const DIALOG_DEFAULT_PROPS = {
  ui: {
    backdropClass() {
      const base = 'fixed inset-0 z-$zIndex transition-background-color duration-$transitionDuration ease-out bg-transparent'
      const active = '[&.is-active]:(bg-darker/70)'

      return {
        base,
        active,
        all: `${base} ${active}`,
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
        all: `${base} ${positionTop} ${positionBottom} ${positionLeft} ${positionRight} ${positionCenter}`,
      } as const
    },

    dialogClass(payload: {
      position: DialogPosition
    }) {
      const { position: positionProp } = payload

      // (a scope's surface, else white / black)
      const base = 'max-h-[min(95%,var(--dialogMaxHeight))] max-w-95vw pointer-events-auto flex flex-col bg-[rgb(var(--color-surface-rgb,255_255_255))] dark:bg-[rgb(var(--color-surface-rgb,0_0_0)/0.95)] backdrop-blur-2px rounded-custom overflow-auto'

      // Position
      let position = ''

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

      position = positions[positionProp]

      const hasTransition = '[&.has-transition]:(transition-all duration-$transitionDuration ease-out)'

      return {
        base,
        positions,
        hasTransition,
        all: `${base} ${position} ${hasTransition}`,
      } as const
    },

    headerClass() {
      // (a scope's border and surface, else true-gray-200 / 700 and white / dark-950)
      const base = 'flex items-center gap-2 p-x-4 p-y-3 border-b border-b-[rgb(var(--color-border-rgb,229_229_229))] dark:border-b-[rgb(var(--color-border-rgb,64_64_64))] bg-[rgb(var(--color-surface-rgb,255_255_255))] dark:bg-[rgb(var(--color-surface-rgb,8_8_8))]'

      return {
        base,
        all: `${base}`,
      } as const
    },

    titleClass() {
      const base = 'flex-grow font-semibold text-lg m-0'

      return {
        base,
        all: `${base}`,
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
        all: `${base} ${dense} ${padding}`,
      } as const
    },
  },
}

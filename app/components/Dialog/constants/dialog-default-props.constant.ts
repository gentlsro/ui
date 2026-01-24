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
      const base = 'flex fixed inset-0 pointer-events-none z-$zIndex'

      const positionTop = '[&[position="top"]]:(justify-center items-start)'
      const positionBottom = '[&[position="bottom"]]:(justify-center items-end)'
      const positionLeft = '[&[position="left"]]:(justify-start items-center)'
      const positionRight = '[&[position="right"]]:(justify-end items-center)'
      const positionCenter = '[&[position="center"]]:(flex-center)'

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

      const base = 'h-120 w-100 max-h-[min(95%,var(--dialogMaxHeight))] max-w-95vw pointer-events-auto flex flex-col dark:bg-black/95 bg-white backdrop-blur-2px rounded-custom overflow-auto'

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
      const base = 'flex items-center gap-2 p-x-4 p-y-3 border-b border-b-truegray-2 dark:border-b-truegray-7 bg-white dark:bg-dark-950'

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

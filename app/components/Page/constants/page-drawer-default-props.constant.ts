// @unocss-include

// Types
import type { IPageDrawerProps } from '../types/page-drawer-props.type'

export const PAGE_DRAWER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'h-full top-0 fixed flex flex-col z-$zPageDrawer pointer-events-none ease-out'
      const print = 'print:hidden'

      return {
        base,
        print,
        all: `${base} ${print}`,
      } as const
    },

    contentClass() {
      const base = 'flex flex-col flex-grow overflow-auto pointer-events-auto bg-primary color-white'

      return {
        base,
        all: `${base}`,
      } as const
    },

    bottomClass() {
      const base = 'flex shrink-0 overflow-auto pointer-events-auto bg-primary color-white p-1'

      return {
        base,
        all: `${base}`,
      } as const
    },

    fillerClass() {
      const base = 'relative shrink-0 border-b-1'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies IPageDrawerProps

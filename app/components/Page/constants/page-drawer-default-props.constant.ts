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
      const base = 'flex flex-col flex-grow overflow-auto pointer-events-auto bg-white dark:bg-dark-950'
      const border = 'dark:group-[.page-drawer--left]:(border-r-1 border-black) light:group-[.page-drawer--left]:(shadow-md shadow-ca)'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    bottomClass() {
      const base = 'flex shrink-0 overflow-auto pointer-events-auto bg-white dark:bg-dark-950 p-1'
      const border = 'dark:group-[.page-drawer--left]:(border-r-1 border-black) light:group-[.page-drawer--left]:(shadow-md shadow-ca)'

      return {
        base,
        border,
        all: `${base} ${border}`,
      } as const
    },

    fillerClass() {
      const base = 'relative shrink-0'
      const border = 'border-b-1 border-black'

      return {
        base,
        border,
        all: `${base}`,
      } as const
    },
  },
} satisfies IPageDrawerProps

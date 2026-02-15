// @unocss-include

export const BURGER_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
    }) {
      const { size: sizeProp } = payload

      const base = 'p-0 self-center rounded-2 flex flex-center'

      // Size variants
      const sizes = {
        xs: 'w-8 h-8',
        xm: 'w-8.5 h-8.5',
        sm: 'w-9 h-9',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },

    burgerClass(payload: {
      size: 'xs' | 'xm' | 'sm' | 'md' | 'lg'
    }) {
      const { size: sizeProp } = payload

      const base = 'rotate-0 transition-transform ease-in-out duration-500 cursor-pointer relative text-black dark:text-white'

      // Size variants
      const sizes = {
        xs: 'w-7 h-7',
        xm: 'w-7.5 h-7.5',
        sm: 'w-8 h-8',
        md: 'w-9 h-9',
        lg: 'w-10 h-10',
      } as const

      const size = sizes[sizeProp]

      return {
        base,
        sizes,
        all: `${base} ${size}`,
      } as const
    },
  },
}

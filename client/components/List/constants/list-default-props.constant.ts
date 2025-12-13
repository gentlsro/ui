import type { IListProps } from '$ui'

export const LIST_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      return {
        'base': function () {
          return 'flex flex-col overflow-auto rounded-custom' as const
        },
        '*': function () {
          return `${this.base()}` as const
        },
      } as const
    },

    // searchClass() {
    //   return {
    //     'base': () => 'flex flex-col gap-1 p-2' as const,
    //     '*': function () {
    //       return `${this.base()}` as const
    //     },
    //   } as const
    // },

    // contentClass(hasSearch) {
    //   return {
    //     'base': () => hasSearch ? 'p-x-2 p-t-0' : 'p-2' as const,
    //     '*': function () {
    //       return `${this.base()}` as const
    //     },
    //   }
    // },

    // rowClass({ isSelected, isFocused, isMulti }) {
    //   return {
    //     'base': () => 'w-full flex gap-1 p-r-2 items-start rounded-custom overflow-auto' as const,
    //     'selected': () => 'bg-slate-100 color-primary dark:(bg-slate-800 color-blue-400)' as const,
    //     'focused': () => 'outline-1 outline-solid outline-primary outline-offset--1' as const,
    //     'multi': () => 'bg-slate-100 color-primary dark:(bg-slate-800 color-blue-400)' as const,
    //     '*': function () {
    //       return `${this.base()}` as const
    //     },
    //   }
    // },
  },
} satisfies IListProps

const x = LIST_DEFAULT_PROPS.ui.containerClass()['*']()

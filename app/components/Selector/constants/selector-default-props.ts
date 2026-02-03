// @unocss-include

// Types
import type { ISelectorProps } from '../types/selector-props.type'

export const SELECTOR_DEFAULT_PROPS = {
  listProps: {
    ui: {
      contentClass(payload) {
        const { hasSearch } = payload
        const base = hasSearch ? 'p-x-2' : 'p-2'

        return {
          ...payload.defaults,
          base,
        } as const
      },

      searchClass() {
        const base = 'gap-1 p-2'

        return {
          base,
          all: `${base}`,
        } as const
      },
    },
  },

  ui: {
    innerClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies ISelectorProps

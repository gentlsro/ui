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
          '*': `${base}`,
        } as const
      },
    },
  },

  ui: {
    appendClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    chipClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    innerClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputClass() {
      const base = 'flex items-center'

      return {
        base,
        '*': `${base}`,
      } as const
    },

    labelClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    contentClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputContainerClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },

    inputInnerContainerClass() {
      const base = ''

      return {
        base,
        '*': `${base}`,
      } as const
    },
  },
} satisfies ISelectorProps

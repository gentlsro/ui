// @unocss-include

// Types
import type { ISelectorProps } from '../types/selector-props.type'
import { SELECTOR_CLASS_COMPOSERS, SELECTOR_CLASS_SLOTS } from './selector-class-slots.constant'

export const SELECTOR_DEFAULT_PROPS = {
  listProps: {
    ui: {
      contentClass(payload) {
        const { hasSearch } = payload
        const base = hasSearch ? 'p-x-2' : 'p-2'

        return withClassPicker({
          ...payload.defaults,
          base,
        } as const)
      },

      searchClass() {
        const base = 'gap-1 p-2'

        return withClassPicker({
          base,
          all: `${base}`,
        } as const)
      },
    },
  },

  ui: {
    innerClass() {
      const slots = SELECTOR_CLASS_SLOTS.innerClass()

      return withClassPicker({ ...slots, all: SELECTOR_CLASS_COMPOSERS.innerClass(slots) } as const)
    },
  },
} satisfies ISelectorProps

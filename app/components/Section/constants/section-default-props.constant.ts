// @unocss-include

// Types
import type { ISectionProps } from '../types/section-props.type'

export const SECTION_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col'
      const dense = '[&.is-dense]:(!p-0)'

      return {
        base,
        dense,
        all: `${base} ${dense}`,
      } as const
    },

    titleClass() {
      const base = 'relative font-semibold m-b-0 p-b-0.5'

      return {
        base,
        all: `${base}`,
      } as const
    },

    subtitleClass() {
      const base = 'font-rem-14 font-400'

      return {
        base,
        all: `${base}`,
      } as const
    },

    contentClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies ISectionProps

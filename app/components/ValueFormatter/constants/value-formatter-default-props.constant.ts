// @unocss-include

// Types
import type { IValueFormatterProps } from '../types/value-formatter-props.type'

export const VALUE_FORMATTER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const base = ''

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
} satisfies Partial<IValueFormatterProps>

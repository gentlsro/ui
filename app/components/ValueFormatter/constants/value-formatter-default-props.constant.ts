// @unocss-include

// Types
import type { IValueFormatterProps } from '../types/value-formatter-props.type'
import { VALUE_FORMATTER_CLASS_COMPOSERS, VALUE_FORMATTER_CLASS_SLOTS } from './value-formatter-class-slots.constant'

export const VALUE_FORMATTER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = VALUE_FORMATTER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: VALUE_FORMATTER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },
  },
} satisfies Partial<IValueFormatterProps>

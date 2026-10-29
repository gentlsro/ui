import type { ButtonStyleProps } from '../types/button-style-props.type'
import { BTN_CLASS_COMPOSERS, BTN_CLASS_SLOTS } from './button-class-slots.constant'

export const BTN_DEFAULT_PROPS = {
  ui: {
    containerClass(props: ButtonStyleProps) {
      const slots = BTN_CLASS_SLOTS.containerClass(props)

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.containerClass(slots, props) } as const)
    },

    iconClass(props: Parameters<typeof BTN_CLASS_SLOTS.iconClass>[0]) {
      const slots = BTN_CLASS_SLOTS.iconClass(props)

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.iconClass(slots, props) } as const)
    },

    labelClass(props: Pick<ButtonStyleProps, 'size' | 'align'>) {
      const slots = BTN_CLASS_SLOTS.labelClass(props)

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.labelClass(slots, props) } as const)
    },

    focusHelperClass() {
      const slots = BTN_CLASS_SLOTS.focusHelperClass()

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.focusHelperClass(slots) } as const)
    },

    loadingClass() {
      const slots = BTN_CLASS_SLOTS.loadingClass()

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.loadingClass(slots) } as const)
    },

    loaderClass(props: Parameters<typeof BTN_CLASS_SLOTS.loaderClass>[0]) {
      const slots = BTN_CLASS_SLOTS.loaderClass(props)

      return withClassPicker({ ...slots, all: BTN_CLASS_COMPOSERS.loaderClass(slots, props) } as const)
    },
  },
}

/**
 * Sizes `labelBreakpoint` takes: the UnoCSS container sizes (`@2xl:` …), so a
 * button drops its label where the container's other `@…:` classes switch
 */
export const BTN_LABEL_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as const

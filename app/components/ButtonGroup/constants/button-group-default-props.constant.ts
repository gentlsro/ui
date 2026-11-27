// @unocss-include

// Types
import type { IButtonGroupProps } from '../types/button-group-props.type'

type IButtonGroupStyleProps = Pick<IButtonGroupProps, 'variant'>

export const BUTTON_GROUP_DEFAULT_PROPS = {
  ui: {
    containerClass(props: IButtonGroupStyleProps = {}) {
      // Equal columns, each as wide as the widest option; the active option is a whole pill inset in the track
      const base = 'inline-grid grid-flow-col auto-cols-fr w-fit max-w-full'
      const pill = 'p-0.5 gap-0.5 rounded-full border-1 border-ca'
      const segmented = 'inline-flex w-fit max-w-full items-stretch min-h-7 p-0.5 gap-0.5 shrink-0 rounded-custom border-1 border-ca bg-slate-100 dark:bg-black'

      return {
        base,
        pill,
        segmented,
        all: props.variant === 'segmented' ? segmented : `${base} ${pill}`,
      } as const
    },

    buttonClass(props: IButtonGroupStyleProps = {}) {
      const segmented = 'p-x-2 rounded-1 font-rem-12 font-medium leading-none tracking-normal color-ca transition-colors hover:color-current'

      const pill = 'justify-center rounded-full!'

      return {
        pill,
        segmented,
        all: props.variant === 'segmented' ? segmented : pill,
      } as const
    },

    activeClass(props: IButtonGroupStyleProps = {}) {
      const pill = 'bg-primary color-white'
      const segmented = '!color-current bg-white dark:bg-white/12 shadow-sm'

      return {
        pill,
        segmented,
        all: props.variant === 'segmented' ? segmented : pill,
      } as const
    },
  },
}

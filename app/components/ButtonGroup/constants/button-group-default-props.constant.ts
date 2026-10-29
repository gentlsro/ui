// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

type IButtonGroupStyleProps = { variant?: 'pill' | 'segmented' }

export const BUTTON_GROUP_CLASS_SLOTS = {
  containerClass(_props: IButtonGroupStyleProps = {}) {
    const base = 'flex'
    const pill = 'rounded-full border-1 border-ca [&>.is-first]:rounded-l-full! [&>.is-last]:rounded-r-full!'
    const segmented = 'inline-flex w-fit max-w-full items-stretch min-h-7 p-0.5 gap-0.5 shrink-0 rounded-custom border-1 border-ca bg-slate-100 dark:bg-black'

    return {
      base,
      pill,
      segmented,
    } as const
  },

  buttonClass(_props: IButtonGroupStyleProps = {}) {
    const segmented = 'p-x-2 rounded-1 font-rem-12 font-medium leading-none tracking-normal color-ca transition-colors hover:color-current'

    return {
      segmented,
    } as const
  },

  activeClass(_props: IButtonGroupStyleProps = {}) {
    const pill = 'bg-primary color-white'
    const segmented = '!color-current bg-white dark:bg-white/12 shadow-sm'

    return {
      pill,
      segmented,
    } as const
  },
}

type ButtonGroupSlots<K extends keyof typeof BUTTON_GROUP_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof BUTTON_GROUP_CLASS_SLOTS[K]>>

export const BUTTON_GROUP_CLASS_COMPOSERS = {
  containerClass(slots: ButtonGroupSlots<'containerClass'>, props: IButtonGroupStyleProps = {}) {
    return props.variant === 'segmented' ? slots.segmented : `${slots.base} ${slots.pill}`
  },

  buttonClass(slots: ButtonGroupSlots<'buttonClass'>, props: IButtonGroupStyleProps = {}) {
    return props.variant === 'segmented' ? slots.segmented : ''
  },

  activeClass(slots: ButtonGroupSlots<'activeClass'>, props: IButtonGroupStyleProps = {}) {
    return props.variant === 'segmented' ? slots.segmented : slots.pill
  },
}

export const BUTTON_GROUP_DEFAULT_PROPS = {
  ui: createUIClassResolver('buttonGroup', {
    slots: BUTTON_GROUP_CLASS_SLOTS,
    compose: BUTTON_GROUP_CLASS_COMPOSERS,
  }, () => uiClassLayers),
}

// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import { uiClassLayers } from '$uiConfig'
import { createUIClassResolver } from '../../../utils/create-ui-class-resolver'

export const TOGGLE_CLASS_SLOTS = {
  containerClass() {
    const base = 'relative flex items-center cursor-pointer select-none rounded-custom gap-1'

    // States (via CSS selectors)
    const readonly = '[&.is-readonly]:(cursor-default)'
    const disabled = '[&.is-disabled]:(cursor-not-allowed op-50)'

    return {
      base,
      readonly,
      disabled,
    } as const
  },

  toggleClass(payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
    contained: boolean
  }) {
    const { size, contained } = payload

    const base = 'flex items-center relative shrink-0 self-start'
    const tapHighlight = '-webkit-tap-highlight-color-transparent'

    // Visual base
    const visual = 'rounded-full border-1 border-ca hover:border-true-gray-400'

    const sizes = {
      xs: 'w-8 h-4.5 m-y-5px m-l-2 m-r-1.5',
      xsContained: 'w-8 h-4.5 m-y-5px m-x-1.5',
      sm: 'w-9.5 h-5.5 m-y-1.25 m-l-3 m-r-1.5',
      smContained: 'w-9.5 h-5.5 m-y-1.25 m-x-1.5',
      md: 'w-11 h-6 m-y-5px m-l-4 m-r-2',
      mdContained: 'w-11 h-6 m-y-5px m-l-2.5 m-r-2',
      lg: 'w-12 h-7 m-y-6px m-l-4.5 m-r-2',
      lgContained: 'w-12 h-7 m-y-6px m-l-2.5 m-r-2',
      auto: '',
      autoContained: '',
    } as const

    // States (via CSS group selectors - container has the state classes)
    const checked = 'group-[.is-checked]:(bg-positive/15 border-positive)'
    const unchecked = 'group-[.is-unchecked]:(bg-negative/15 border-negative)'
    const indeterminate = 'group-[.is-indeterminate]:(bg-neutral/15 border-neutral)'

    // Readonly
    const readonly = 'group-[.is-readonly]:(border-dotted)'

    return {
      base,
      tapHighlight,
      visual,
      sizes,
      checked,
      unchecked,
      indeterminate,
      readonly,
      size: (contained && size !== 'auto' ? sizes[`${size}Contained`] : sizes[size]) as string,
    } as const
  },

  bulletClass(payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
    contained: boolean
  }) {
    const { size, contained } = payload

    const base = 'relative ease-linear flex flex-center rounded-full'

    const sizes = {
      xs: 'h-5 w-5',
      xsContained: 'h-3.5 w-3.5',
      sm: 'h-6 w-6',
      smContained: 'h-4.5 w-4.5',
      md: 'h-7 w-7',
      mdContained: 'h-5 w-5',
      lg: 'h-8 w-8',
      lgContained: 'h-6 w-6',
      auto: '',
      autoContained: '',
    } as const

    // Hover effect
    const hoverable = 'group-[.is-hoverable]:group-hover:(shadow-consistent-xs-fill shadow-ca)'

    // State colors (via CSS group selectors)
    const checked = 'group-[.is-checked]:(bg-positive)'
    const unchecked = 'group-[.is-unchecked]:(bg-negative)'
    const indeterminate = 'group-[.is-indeterminate]:(bg-neutral)'

    // Readonly states (via CSS group selectors)
    const readonlyChecked = 'group-[.is-readonly.is-checked]:(bg-positive/50 border-2 border-dotted border-positive)'
    const readonlyUnchecked = 'group-[.is-readonly.is-unchecked]:(bg-negative/50 border-2 border-dotted border-negative)'

    // Position - unchecked
    let uncheckedPosition = ''

    const uncheckedPositions = {
      xs: 'group-[.is-unchecked]:(translate-x--4px translate-y--0.5px)',
      xsContained: 'group-[.is-unchecked]:(translate-x-1.5px)',
      sm: 'group-[.is-unchecked]:(translate-x--4px)',
      smContained: 'group-[.is-unchecked]:(translate-x-1.5px)',
      md: 'group-[.is-unchecked]:(translate-x--6px)',
      mdContained: 'group-[.is-unchecked]:(translate-x-1.5px)',
      lg: 'group-[.is-unchecked]:(translate-x--6px)',
      lgContained: 'group-[.is-unchecked]:(translate-x-1.5px)',
      auto: '',
      autoContained: '',
    } as const

    uncheckedPosition = contained && size !== 'auto'
      ? uncheckedPositions[`${size}Contained`]
      : uncheckedPositions[size]

    // Position - checked
    let checkedPosition = ''

    const checkedPositions = {
      xs: 'group-[.is-checked]:(translate-x-14px)',
      xsContained: 'group-[.is-checked]:(translate-x-15px)',
      sm: 'group-[.is-checked]:(translate-x-16px)',
      smContained: 'group-[.is-checked]:(translate-x-17px)',
      md: 'group-[.is-checked]:(translate-x-20px)',
      mdContained: 'group-[.is-checked]:(translate-x-21px)',
      lg: 'group-[.is-checked]:(translate-x-20px)',
      lgContained: 'group-[.is-checked]:(translate-x-21px)',
      auto: '',
      autoContained: '',
    } as const

    checkedPosition = contained && size !== 'auto'
      ? checkedPositions[`${size}Contained`]
      : checkedPositions[size]

    // Position - indeterminate
    let indeterminatePosition = ''

    const indeterminatePositions = {
      xs: 'group-[.is-indeterminate]:(translate-x-5px)',
      xsContained: 'group-[.is-indeterminate]:(translate-x-8px)',
      sm: 'group-[.is-indeterminate]:(translate-x-6px)',
      smContained: 'group-[.is-indeterminate]:(translate-x-9px)',
      md: 'group-[.is-indeterminate]:(translate-x-7px)',
      mdContained: 'group-[.is-indeterminate]:(translate-x-11px)',
      lg: 'group-[.is-indeterminate]:(translate-x-7px)',
      lgContained: 'group-[.is-indeterminate]:(translate-x-12px)',
      auto: '',
      autoContained: '',
    } as const

    indeterminatePosition = contained && size !== 'auto'
      ? indeterminatePositions[`${size}Contained`]
      : indeterminatePositions[size]

    const positions = `${uncheckedPosition} ${checkedPosition} ${indeterminatePosition}` as const

    return {
      base,
      size: (contained && size !== 'auto' ? sizes[`${size}Contained`] : sizes[size]) as string,
      sizes,
      hoverable,
      checked,
      unchecked,
      indeterminate,
      readonlyChecked,
      readonlyUnchecked,
      positions,
    } as const
  },

  labelClass(payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
  }) {
    const { size } = payload

    const base = 'p-r-3'

    const sizes = {
      xs: 'font-rem-13 p-y-0.5',
      sm: 'font-rem-14 p-y-1 m-b-2px',
      md: 'p-y-1 m-b-3px',
      lg: 'font-rem-18 p-y-1 m-b-3px',
      auto: '',
    } as const

    return {
      base,
      size: (sizes[size]) as string,
      sizes,
    } as const
  },

  iconClass() {
    const base = ''

    return {
      base,
    } as const
  },

  focusHelperClass() {
    const base = 'absolute fit z-3 cursor-pointer rounded-inherit inset-0 pointer-events-none'
    const hover = 'group-hover:(bg-current opacity-10)'

    return {
      base,
      hover,
    } as const
  },
}

type ToggleSlots<K extends keyof typeof TOGGLE_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof TOGGLE_CLASS_SLOTS[K]>>

export const TOGGLE_CLASS_COMPOSERS = {
  containerClass(slots: ToggleSlots<'containerClass'>) {
    return `${slots.base} ${slots.readonly} ${slots.disabled}`
  },

  toggleClass(slots: ToggleSlots<'toggleClass'>, _payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
    contained: boolean
  }) {
    return `${slots.base} ${slots.tapHighlight} ${slots.visual} ${slots.size} ${slots.checked} ${slots.unchecked} ${slots.indeterminate} ${slots.readonly}`
  },

  bulletClass(slots: ToggleSlots<'bulletClass'>, _payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
    contained: boolean
  }) {
    return `${slots.base} ${slots.size} ${slots.hoverable} ${slots.checked} ${slots.unchecked} ${slots.indeterminate} ${slots.readonlyChecked} ${slots.readonlyUnchecked} ${slots.positions}`
  },

  labelClass(slots: ToggleSlots<'labelClass'>, _payload: {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'auto'
  }) {
    return `${slots.base} ${slots.size}`
  },

  iconClass(slots: ToggleSlots<'iconClass'>) {
    return slots.base
  },

  focusHelperClass(slots: ToggleSlots<'focusHelperClass'>) {
    return `${slots.base} ${slots.hover}`
  },
}

/** Recompute named slots after layer patches without accessor allocation. */
export const TOGGLE_CLASS_DERIVED = {
  toggleClass: {
    size(slots: ToggleSlots<'toggleClass'>, payload: Parameters<typeof TOGGLE_CLASS_SLOTS.toggleClass>[0]): string {
      const { size, contained } = payload

      return contained && size !== 'auto' ? slots.sizes[`${size}Contained`] : slots.sizes[size]
    },
  },
  bulletClass: {
    size(slots: ToggleSlots<'bulletClass'>, payload: Parameters<typeof TOGGLE_CLASS_SLOTS.bulletClass>[0]): string {
      const { size, contained } = payload

      return contained && size !== 'auto' ? slots.sizes[`${size}Contained`] : slots.sizes[size]
    },
  },
  labelClass: {
    size(slots: ToggleSlots<'labelClass'>, payload: Parameters<typeof TOGGLE_CLASS_SLOTS.labelClass>[0]): string {
      const { size } = payload

      return slots.sizes[size]
    },
  },
}

export const TOGGLE_DEFAULT_PROPS = {
  ui: createUIClassResolver('toggle', {
    slots: TOGGLE_CLASS_SLOTS,
    compose: TOGGLE_CLASS_COMPOSERS,
    derive: TOGGLE_CLASS_DERIVED,
  }, () => uiClassLayers),
}

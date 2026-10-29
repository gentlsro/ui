// @unocss-include

import type { WidenClassSlots } from '../../../types/ui-class-config.type'
import type { Day } from '#layers/utilities/app/models/day.model'

type DatePickerDayState = { day: Day, isSelected?: boolean, disabled?: boolean }

export const DATE_PICKER_CLASS_SLOTS = {
  containerClass() {
    const base = 'flex flex-col overflow-auto bg-white color-slate-700 dark:bg-dark-950 dark:color-inherit'

    return {
      base,
    } as const
  },

  daysGridClass() {
    const base = 'grid grid-cols-7 gap-2px p-x-2 p-b-2'

    return {
      base,
    } as const
  },

  dayClass(_payload: DatePickerDayState) {
    const base = 'relative flex flex-col justify-center font-medium select-none rounded-2'
    const hover = 'hover:bg-slate-100 hover:color-slate-900 dark:hover:bg-true-gray-200/10 dark:hover:color-white'
    const weekend = 'bg-slate-50 dark:bg-true-gray-200/3'
    const outside = 'color-slate-400 dark:color-true-gray-500'
    const selected = 'bg-primary font-semibold'
    const color = 'color-white dark:color-white'
    const disabled = 'cursor-not-allowed color-true-gray-400 dark:color-true-gray-600'
    const interactive = 'cursor-pointer'

    return {
      base,
      hover,
      weekend,
      outside,
      selected,
      color,
      disabled,
      interactive,
    } as const
  },

  dayNumberClass(_payload: DatePickerDayState) {
    const base = 'flex flex-center relative rounded-full font-rem-13 leading-none w-7 h-7'
    const today = 'outline-1 outline-solid font-semibold'
    const outline = 'outline-primary'
    const selected = 'outline-white'

    return {
      base,
      today,
      outline,
      selected,
    } as const
  },

  dayEdgeClass(_payload: DatePickerDayState) {
    const base = 'absolute top-.5 right-1 whitespace-nowrap font-rem-9 leading-none'
    const color = 'color-slate-400 dark:color-true-gray-500'
    const selected = 'color-white/70'

    return {
      base,
      color,
      selected,
    } as const
  },

  dayNumberWrapperClass() {
    const base = 'flex flex-center'

    return {
      base,
    } as const
  },

  dayEventsClass() {
    const base = 'flex flex-1 flex-center px-1 py-2px overflow-hidden'

    return {
      base,
    } as const
  },

  dayEventsContainerClass() {
    const base = 'flex flex-1 flex-wrap gap-px flex-center bg-white/20 dark:bg-dark-950/20 rounded-custom'

    return {
      base,
    } as const
  },

  dayEventClass() {
    const base = 'w-3 h-3 hover:scale-120 transition-transform-300'

    return {
      base,
    } as const
  },

  controlsClass() {
    const base = 'flex items-center p-x-2 p-y-1 rounded-b-custom'
    const bg = 'bg-white dark:bg-dark-950'
    const border = 'border-t-1 border-slate-100 dark:border-dark-700'

    return {
      base,
      bg,
      border,
    } as const
  },
}

type DatePickerSlots<K extends keyof typeof DATE_PICKER_CLASS_SLOTS>
  = WidenClassSlots<ReturnType<typeof DATE_PICKER_CLASS_SLOTS[K]>>

export const DATE_PICKER_CLASS_COMPOSERS = {
  containerClass(slots: DatePickerSlots<'containerClass'>) {
    return slots.base
  },

  daysGridClass(slots: DatePickerSlots<'daysGridClass'>) {
    return slots.base
  },

  dayClass(slots: DatePickerSlots<'dayClass'>, { day, isSelected, disabled: isDisabled }: DatePickerDayState) {
    return [
      slots.base,
      !isDisabled && slots.interactive,
      !isDisabled && !isSelected && slots.hover,
      day.isWeekend && !isSelected && slots.weekend,
      day.isNotCurrent && !isSelected && !isDisabled && slots.outside,
      isSelected && slots.selected,
      isSelected && !isDisabled && slots.color,
      isDisabled && slots.disabled,
    ].filter(Boolean).join(' ')
  },

  dayNumberClass(slots: DatePickerSlots<'dayNumberClass'>, { day, isSelected }: DatePickerDayState) {
    return [
      slots.base,
      day.isToday && slots.today,
      day.isToday && !isSelected && slots.outline,
      isSelected && slots.selected,
    ].filter(Boolean).join(' ')
  },

  dayEdgeClass(slots: DatePickerSlots<'dayEdgeClass'>, { isSelected }: DatePickerDayState) {
    return `${slots.base} ${isSelected ? slots.selected : slots.color}`
  },

  dayNumberWrapperClass(slots: DatePickerSlots<'dayNumberWrapperClass'>) {
    return slots.base
  },

  dayEventsClass(slots: DatePickerSlots<'dayEventsClass'>) {
    return slots.base
  },

  dayEventsContainerClass(slots: DatePickerSlots<'dayEventsContainerClass'>) {
    return slots.base
  },

  dayEventClass(slots: DatePickerSlots<'dayEventClass'>) {
    return slots.base
  },

  controlsClass(slots: DatePickerSlots<'controlsClass'>) {
    return `${slots.base} ${slots.bg} ${slots.border}`
  },
}

// @unocss-include

import type { DatePickerDayState } from '../types/datepicker-props.type'
import { DATE_PICKER_CLASS_COMPOSERS, DATE_PICKER_CLASS_SLOTS } from './datepicker-class-slots.constant'

export const DATE_PICKER_DEFAULT_PROPS = {
  ui: {
    containerClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.containerClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.containerClass(slots) } as const)
    },

    daysGridClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.daysGridClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.daysGridClass(slots) } as const)
    },

    dayClass(payload: Parameters<typeof DATE_PICKER_CLASS_SLOTS.dayClass>[0]) {
      const slots = DATE_PICKER_CLASS_SLOTS.dayClass(payload)

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayClass(slots, payload) } as const)
    },

    dayNumberClass(payload: Parameters<typeof DATE_PICKER_CLASS_SLOTS.dayNumberClass>[0]) {
      const slots = DATE_PICKER_CLASS_SLOTS.dayNumberClass(payload)

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayNumberClass(slots, payload) } as const)
    },

    dayEdgeClass(payload: Parameters<typeof DATE_PICKER_CLASS_SLOTS.dayEdgeClass>[0]) {
      const slots = DATE_PICKER_CLASS_SLOTS.dayEdgeClass(payload)

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayEdgeClass(slots, payload) } as const)
    },

    dayNumberWrapperClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.dayNumberWrapperClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayNumberWrapperClass(slots) } as const)
    },

    dayEventsClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.dayEventsClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayEventsClass(slots) } as const)
    },

    dayEventsContainerClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.dayEventsContainerClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayEventsContainerClass(slots) } as const)
    },

    dayEventClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.dayEventClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.dayEventClass(slots) } as const)
    },

    controlsClass() {
      const slots = DATE_PICKER_CLASS_SLOTS.controlsClass()

      return withClassPicker({ ...slots, all: DATE_PICKER_CLASS_COMPOSERS.controlsClass(slots) } as const)
    },
  },
}

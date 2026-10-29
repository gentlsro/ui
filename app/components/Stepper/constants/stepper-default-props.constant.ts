import { STEPPER_CLASS_COMPOSERS, STEPPER_CLASS_SLOTS } from './stepper-class-slots.constant'

// @unocss-include

export const STEPPER_DEFAULT_PROPS = {
  ui: {
    containerClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.containerClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.containerClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.containerClass(slots, payload) } as const)
    },

    navigationClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.navigationClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.navigationClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.navigationClass(slots, payload) } as const)
    },

    itemClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.itemClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.itemClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.itemClass(slots, payload) } as const)
    },

    triggerClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.triggerClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.triggerClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.triggerClass(slots, payload) } as const)
    },

    indicatorClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.indicatorClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.indicatorClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.indicatorClass(slots, payload) } as const)
    },

    iconClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.iconClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.iconClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.iconClass(slots, payload) } as const)
    },

    separatorClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.separatorClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.separatorClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.separatorClass(slots, payload) } as const)
    },

    textClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.textClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.textClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.textClass(slots, payload) } as const)
    },

    labelClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.labelClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.labelClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.labelClass(slots, payload) } as const)
    },

    descriptionClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.descriptionClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.descriptionClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.descriptionClass(slots, payload) } as const)
    },

    panelsClass(payload: Parameters<typeof STEPPER_CLASS_SLOTS.panelsClass>[0]) {
      const slots = STEPPER_CLASS_SLOTS.panelsClass(payload)

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.panelsClass(slots, payload) } as const)
    },

    stepClass() {
      const slots = STEPPER_CLASS_SLOTS.stepClass()

      return withClassPicker({ ...slots, all: STEPPER_CLASS_COMPOSERS.stepClass(slots) } as const)
    },
  },
}

<script setup lang="ts" vapor>
// Types
import type { IStepperSlotProps, IStepperStep } from './composables/useStepperUtils'

// Functions
import { stepperContextKey } from './composables/useStepperUtils'

// Constants
import { STEPPER_DEFAULT_PROPS } from './constants/stepper-default-props.constant'

// Components
import IconRenderer from '../Icon/IconRenderer.vue'

const slots = defineSlots<{
  indicator?: (props: IStepperSlotProps) => any
  label?: (props: IStepperSlotProps) => any
  description?: (props: IStepperSlotProps) => any
}>()

// Layout
// NOTE: The steps are read here and not passed from the `Stepper` as a prop, this component renders after the
// `Stepper`'s default slot, so all steps are registered by then ~ also during SSR and hydration
const stepper = inject(stepperContextKey)!

function getStateClasses(step: IStepperStep) {
  return {
    [`is-${step.status}`]: true,
    'is-disabled': step.isDisabled,
    'is-first': step.isFirst,
    'is-last': step.isLast,
  }
}

function getSlotProps(step: IStepperStep): IStepperSlotProps {
  return { step: step.props, idx: step.idx, status: step.status }
}

function getText(text?: string | (() => string)) {
  return typeof text === 'function' ? text() : text
}

function getIndicatorIcon(step: IStepperStep) {
  if (step.status === 'completed') {
    return stepper.completedIcon.value ?? step.props.icon
  }

  if (step.status === 'error') {
    return stepper.errorIcon.value ?? step.props.icon
  }

  return step.props.icon
}

// Iconify names (`lucide:user`) and UnoCSS icon classes (`i-lucide:user`) render natively ~ like `Btn`
function getResolvedIndicatorIcon(step: IStepperStep) {
  return resolveIconValue(getIndicatorIcon(step))
}

function getLabel(step: IStepperStep) {
  return getText(step.props.label) ?? step.props.name
}

function hasText(step: IStepperStep) {
  return !!(getLabel(step) || step.props.description || slots.label || slots.description)
}

// Styles - navigation
const navigationClass = computed(() => {
  return stepper.ui.value?.navigationClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.navigationClass({ layout: stepper.layout.value }),
  })
})

const navigationStyle = computed(() => {
  return stepper.ui.value?.navigationStyle?.()
})

// Styles - item
const itemClass = computed(() => {
  return stepper.ui.value?.itemClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.itemClass({ layout: stepper.layout.value }),
  })
})

const itemStyle = computed(() => {
  return stepper.ui.value?.itemStyle?.()
})

// Styles - trigger
const triggerClass = computed(() => {
  return stepper.ui.value?.triggerClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.triggerClass({ layout: stepper.layout.value }),
  })
})

const triggerStyle = computed(() => {
  return stepper.ui.value?.triggerStyle?.()
})

// Styles - indicator
const indicatorClass = computed(() => {
  return stepper.ui.value?.indicatorClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.indicatorClass({ size: stepper.size.value }),
  })
})

const indicatorStyle = computed(() => {
  return stepper.ui.value?.indicatorStyle?.()
})

// Styles - icon
const iconClass = computed(() => {
  return stepper.ui.value?.iconClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.iconClass({ size: stepper.size.value }),
  })
})

const iconStyle = computed(() => {
  return stepper.ui.value?.iconStyle?.()
})

// Styles - separator
const separatorClass = computed(() => {
  return stepper.ui.value?.separatorClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.separatorClass({ layout: stepper.layout.value }),
  })
})

const separatorStyle = computed(() => {
  return stepper.ui.value?.separatorStyle?.()
})

// Styles - text
const textClass = computed(() => {
  return stepper.ui.value?.textClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.textClass({ layout: stepper.layout.value }),
  })
})

const textStyle = computed(() => {
  return stepper.ui.value?.textStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return stepper.ui.value?.labelClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.labelClass({ size: stepper.size.value }),
  })
})

const labelStyle = computed(() => {
  return stepper.ui.value?.labelStyle?.()
})

// Styles - description
const descriptionClass = computed(() => {
  return stepper.ui.value?.descriptionClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.descriptionClass({ size: stepper.size.value }),
  })
})

const descriptionStyle = computed(() => {
  return stepper.ui.value?.descriptionStyle?.()
})
</script>

<template>
  <ol
    :class="navigationClass"
    :style="navigationStyle"
  >
    <li
      v-for="step in stepper.steps.value"
      :key="step.id"
      class="stepper-item"
      :class="[getStateClasses(step), itemClass]"
      :style="itemStyle"
    >
      <button
        type="button"
        class="stepper-trigger"
        :class="[getStateClasses(step), triggerClass]"
        :style="triggerStyle"
        :disabled="!step.isSelectable"
        :aria-current="step.isActive ? 'step' : undefined"
        @click="stepper.select(step.props.name)"
      >
        <!-- Indicator -->
        <span
          class="stepper-indicator"
          :class="[getStateClasses(step), indicatorClass]"
          :style="indicatorStyle"
        >
          <slot
            name="indicator"
            v-bind="getSlotProps(step)"
          >
            <IconRenderer
              v-if="getResolvedIndicatorIcon(step).name"
              :name="getResolvedIndicatorIcon(step).name!"
              :class="[getResolvedIndicatorIcon(step).classes, iconClass]"
              :style="iconStyle"
            />

            <span
              v-else-if="getIndicatorIcon(step)"
              :class="[getResolvedIndicatorIcon(step).classes, iconClass]"
              :style="iconStyle"
            />

            <!-- An element keeps the Vapor hydration anchors of this branch aligned -->
            <span v-else>{{ step.idx + 1 }}</span>
          </slot>
        </span>

        <!-- Label & description -->
        <span
          v-if="hasText(step)"
          class="stepper-text"
          :class="textClass"
          :style="textStyle"
        >
          <span
            class="stepper-label"
            :class="[getStateClasses(step), labelClass]"
            :style="labelStyle"
          >
            <slot
              name="label"
              v-bind="getSlotProps(step)"
            >
              {{ getLabel(step) }}
            </slot>
          </span>

          <span
            v-if="step.props.description || slots.description"
            class="stepper-description"
            :class="[getStateClasses(step), descriptionClass]"
            :style="descriptionStyle"
          >
            <slot
              name="description"
              v-bind="getSlotProps(step)"
            >
              {{ getText(step.props.description) }}
            </slot>
          </span>
        </span>
      </button>

      <div
        v-if="!step.isLast"
        class="stepper-separator"
        :class="[{ 'is-completed': step.isPassed }, separatorClass]"
        :style="separatorStyle"
      />
    </li>
  </ol>
</template>

<script setup lang="ts" vapor>
// Types
import type { IStepperProps } from './types/stepper-props.type'
import type { IStepperSlotProps } from './composables/useStepperUtils'

// Functions
import { stepperContextKey, useStepperUtils } from './composables/useStepperUtils'

// Constants
import { STEPPER_DEFAULT_PROPS } from './constants/stepper-default-props.constant'

const props = withDefaults(defineProps<IStepperProps>(), {
  ...getComponentProps('stepper'),
})

defineSlots<{
  default?: () => any
  indicator?: (props: IStepperSlotProps) => any
  label?: (props: IStepperSlotProps) => any
  description?: (props: IStepperSlotProps) => any
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('stepper', props)
})

const size = computed(() => props.size ?? 'md')

const layout = computed(() => {
  if (props.orientation === 'vertical') {
    return 'vertical'
  }

  return props.labelPlacement === 'bottom' ? 'horizontalBottom' : 'horizontal'
})

// Layout
const sourceModel = defineModel<string>()
const stepper = useStepperUtils(props, sourceModel)
const panelsEl = ref<HTMLElement>()

provide(stepperContextKey, {
  registerStep: stepper.registerStep,
  select: stepper.select,
  steps: stepper.steps,
  ui: computed(() => mergedProps.value.ui),
  layout,
  size,
  completedIcon: computed(() => props.completedIcon),
  errorIcon: computed(() => props.errorIcon),
})

useMutationObserver(panelsEl, stepper.handleMutations, { childList: true, subtree: true })
onMounted(stepper.syncOrder)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.containerClass({ layout: layout.value, size: size.value }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - panels
const panelsClass = computed(() => {
  return mergedProps.value?.ui?.panelsClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.panelsClass({ layout: layout.value }),
  })
})

const panelsStyle = computed(() => {
  return mergedProps.value?.ui?.panelsStyle?.()
})

defineExpose({
  next: stepper.next,
  prev: stepper.prev,
  hasNext: stepper.hasNext,
  hasPrev: stepper.hasPrev,
})
</script>

<template>
  <div
    class="stepper"
    :class="[`stepper--${layout}`, containerClass]"
    :style="containerStyle"
  >
    <!-- The steps register before the navigation renders, also during SSR and hydration -->
    <div
      ref="panelsEl"
      class="stepper-panels"
      :class="panelsClass"
      :style="panelsStyle"
    >
      <slot />
    </div>

    <!-- Nothing here may read the steps, only `StepperNavigation` (rendered after them) does -->
    <StepperNavigation class="stepper-navigation">
      <template
        v-if="$slots.indicator"
        #indicator="slotProps"
      >
        <slot
          name="indicator"
          v-bind="slotProps"
        />
      </template>

      <template
        v-if="$slots.label"
        #label="slotProps"
      >
        <slot
          name="label"
          v-bind="slotProps"
        />
      </template>

      <template
        v-if="$slots.description"
        #description="slotProps"
      >
        <slot
          name="description"
          v-bind="slotProps"
        />
      </template>
    </StepperNavigation>
  </div>
</template>

<style lang="scss" scoped>
.stepper-navigation {
  @apply order-first;
}
</style>

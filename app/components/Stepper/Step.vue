<script setup lang="ts">
// Types
import type { IStepProps } from './types/step-props.type'

// Functions
import { stepperContextKey } from './composables/useStepperUtils'

// Constants
import { STEPPER_DEFAULT_PROPS } from './constants/stepper-default-props.constant'

defineOptions({ name: 'Step' })

const props = withDefaults(defineProps<IStepProps>(), {
  ...getComponentProps('step'),
})

defineSlots<{
  default?: (props: { step: IStepProps }) => any
}>()

// Layout
const stepper = inject(stepperContextKey, undefined)
const stepEl = ref<HTMLElement>()
const registration = stepper?.registerStep(props, stepEl)

const isActive = computed(() => registration?.isActive.value ?? true)

onScopeDispose(() => {
  registration?.unregister()
})

// Styles - step
const stepClass = computed(() => {
  return stepper?.ui.value?.stepClass?.({
    defaults: STEPPER_DEFAULT_PROPS.ui.stepClass(),
  })
})

const stepStyle = computed(() => {
  return stepper?.ui.value?.stepStyle?.()
})
</script>

<template>
  <div
    v-show="isActive"
    ref="stepEl"
    class="step"
    :class="[{ 'is-active': isActive }, stepClass]"
    :style="stepStyle"
  >
    <slot
      v-if="isActive"
      :step="props"
    />
  </div>
</template>

<script setup lang="ts">
// Types
import type { IConfirmationProps } from './types/confirmation-props.type'

// Constants
import { CONFIRMATION_DEFAULT_PROPS } from './constants/confirmation-default-props.constant'

const props = withDefaults(defineProps<IConfirmationProps>(), {
  ...getComponentProps('confirmation'),
})

const emits = defineEmits<{
  (e: 'close'): void
  (e: 'update:visible', val: boolean): void
}>()

const model = defineModel<boolean>('visible')

// Layout
const mergedProps = computed(() => getComponentMergedProps('confirmation', props))

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: CONFIRMATION_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - checkmark
const checkmarkClass = computed(() => {
  return mergedProps.value?.ui?.checkmarkClass?.({
    defaults: CONFIRMATION_DEFAULT_PROPS.ui.checkmarkClass(),
  })
})

const checkmarkStyle = computed(() => {
  return mergedProps.value?.ui?.checkmarkStyle?.()
})

// Styles - text
const textClass = computed(() => {
  return mergedProps.value?.ui?.textClass?.({
    defaults: CONFIRMATION_DEFAULT_PROPS.ui.textClass(),
  })
})

const textStyle = computed(() => {
  return mergedProps.value?.ui?.textStyle?.()
})

// Styles - actions
const actionsClass = computed(() => {
  return mergedProps.value?.ui?.actionsClass?.({
    defaults: CONFIRMATION_DEFAULT_PROPS.ui.actionsClass(),
  })
})

const actionsStyle = computed(() => {
  return mergedProps.value?.ui?.actionsStyle?.()
})

const transitionProps = computed(() => ({
  enterActiveClass: 'animate-fade-in-up animate-duration-350',
  leaveActiveClass: 'animate-fade-out animate-duration-350',
}))

function handleClose() {
  model.value = false
  emits('close')
}
</script>

<template>
  <Transition v-bind="transitionProps">
    <div
      v-if="visible"
      class="confirmation"
      :class="containerClass"
      :style="containerStyle"
    >
      <!-- Checkmark -->
      <div
        class="confirmation-checkmark"
        :class="checkmarkClass"
        :style="checkmarkStyle"
      >
        <slot name="checkmark">
          <Checkmark
            :delay="delay"
            w="35"
            h="35"
          />
        </slot>

        <slot>
          <span
            class="confirmation-text"
            :class="textClass"
            :style="textStyle"
          >
            <span>
              {{ confirmationText }}
            </span>
          </span>
        </slot>
      </div>

      <!-- Actions -->
      <div
        v-if="!noActions"
        class="confirmation-actions"
        :class="actionsClass"
        :style="actionsStyle"
      >
        <slot name="actions" />
        <Btn
          :label="$t('general.close')"
          no-uppercase
          icon="i-solar:close-square-broken"
          color="negative"
          @click="handleClose"
        />
      </div>
    </div>
  </Transition>
</template>

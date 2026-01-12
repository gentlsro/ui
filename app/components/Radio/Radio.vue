<script setup lang="ts">
// Types
import type { IRadioProps } from './types/radio-props.type'

// Constants
import { RADIO_DEFAULT_PROPS } from './constants/radio-default-props.constant'

const props = withDefaults(defineProps<IRadioProps>(), {
  ...getComponentProps('radio'),
})

const emits = defineEmits<{
  (e: 'update:model-value', value: any): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('radio', props)
})

// Layout
const isChecked = computed(() => {
  return (
    props.comparatorFn?.(props.modelValue, props.val)
    ?? props.modelValue === props.val
  )
})

function handleCheck(ev: Event) {
  if (!props.disabled) {
    ev.preventDefault()
    ev.stopPropagation()

    emits('update:model-value', props.val)
  }
}

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: RADIO_DEFAULT_PROPS.ui.containerClass({
      size: props.size ?? 'sm',
    }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - radio
const radioClass = computed(() => {
  return mergedProps.value?.ui?.radioClass?.({
    defaults: RADIO_DEFAULT_PROPS.ui.radioClass({
      size: props.size ?? 'sm',
      color: props.color ?? 'primary',
    }),
  })
})

const radioStyle = computed(() => {
  return mergedProps.value?.ui?.radioStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: RADIO_DEFAULT_PROPS.ui.labelClass({
      size: props.size ?? 'sm',
    }),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.({
    defaults: RADIO_DEFAULT_PROPS.ui.focusHelperClass(),
  })
})

const focusHelperStyle = computed(() => {
  return mergedProps.value?.ui?.focusHelperStyle?.()
})
</script>

<template>
  <label
    tabindex="0"
    class="radio__container group"
    :class="[
      { 'is-checked': isChecked, 'is-disabled': disabled },
      containerClass,
    ]"
    :style="containerStyle"
    @keyup.enter.space="handleCheck"
    @keydown.enter.space="handleCheck"
    @click="handleCheck"
  >
    <input
      type="radio"
      class="radio-input"
      tabindex="-1"
      hidden
      :name="name"
      :checked="isChecked"
    >

    <RadioButton
      class="radio"
      :checked="isChecked"
      :class="radioClass"
      :style="radioStyle"
    />

    <slot>
      <span
        v-if="label"
        class="radio-label"
        :class="labelClass"
        :style="labelStyle"
      >
        {{ label }}
      </span>
    </slot>

    <span
      v-if="!noHoverEffect"
      class="radio-focus-helper"
      :class="focusHelperClass"
      :style="focusHelperStyle"
    />
  </label>
</template>

<style lang="scss" scoped>
.radio__container {
  transition: all 0.15s ease;
}

.radio {
  &:hover {
    :deep(.inner.unchecked) {
      @apply scale-100 opacity-60;
    }
  }
}
</style>

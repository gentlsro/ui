<script setup lang="ts">
// Types
import type { IButtonGroupProps } from './types/button-group-props.type'

// Constants
import { BUTTON_GROUP_LAYERED_CLASSES } from './constants/button-group-layered-classes.constant'

const props = withDefaults(defineProps<IButtonGroupProps>(), {
  ...getComponentProps('buttonGroup'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('buttonGroup', props)
})

// Layout
const model = defineModel<IButtonGroupProps['modelValue']>()

const isSegmented = computed(() => props.variant === 'segmented')

const styleProps = computed(() => ({ variant: props.variant }))

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BUTTON_GROUP_LAYERED_CLASSES.containerClass(styleProps.value),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - button
const buttonClass = computed(() => {
  return mergedProps.value?.ui?.buttonClass?.({
    defaults: BUTTON_GROUP_LAYERED_CLASSES.buttonClass(styleProps.value),
  })
})

// Styles - active button
const activeClass = computed(() => {
  return mergedProps.value?.ui?.activeClass?.({
    defaults: BUTTON_GROUP_LAYERED_CLASSES.activeClass(styleProps.value),
  })
})

const activeStyle = computed(() => {
  return mergedProps.value?.ui?.activeStyle?.()
})

// The segmented buttons size and style themselves: the button's own size, case and hover overlay stay out
const segmentedBtnProps = {
  size: 'auto',
  noUppercase: true,
  noBold: true,
  noDim: true,
  noHoverEffect: true,
  ripple: false,
} as const

function select(value: unknown) {
  if (props.disabled || (isSegmented.value && value === model.value)) {
    return
  }

  model.value = value as IButtonGroupProps['modelValue']
}
</script>

<template>
  <div
    class="btn-group group/btn-group"
    :class="containerClass"
    :style="containerStyle"
    :role="isSegmented ? 'radiogroup' : undefined"
  >
    <Btn
      v-for="(btn, idx) in buttons"
      :key="idx"
      v-bind="isSegmented ? { ...segmentedBtnProps, ...btn } : btn"
      :disabled
      disable-style="flat"
      :role="isSegmented ? 'radio' : undefined"
      :aria-checked="isSegmented ? model === btn.value : undefined"
      :class="[
        buttonClass,
        model === btn.value && activeClass,
        { 'is-first': idx === 0, 'is-last': idx === buttons.length - 1 },
      ]"
      :style="btn.value === modelValue ? activeStyle : undefined"
      @click="select(btn.value)"
    >
      <template #default>
        <slot :name="btn.value" />
      </template>
    </Btn>
  </div>
</template>

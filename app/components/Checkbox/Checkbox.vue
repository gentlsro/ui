<script setup lang="ts">
// Types
import type { ICheckboxProps } from './types/checkbox-props.type'

// Constants
import { CHECKBOX_DEFAULT_PROPS } from './constants/checkbox-default-props.constant'

const props = withDefaults(defineProps<ICheckboxProps>(), {
  ...getComponentProps('checkbox'),
})

defineExpose({
  focus: () => labelEl.value?.focus(),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('checkbox', props)
})

// Layout
const model = defineModel()
const labelEl = ref<HTMLElement>()

const label = computed(() => {
  if (typeof props.label === 'function') {
    return props.label()
  }

  return props.label
})

const isChecked = computed(() => {
  // When custom function is provided, use it
  if (props.comparatorFn) {
    return props.comparatorFn(model.value, props.checkValue)
  }

  // When using array, we check if the value is inside the array
  if (Array.isArray(model.value)) {
    return model.value.includes(props.checkValue)
  }

  // Otherwise, we just compare the values
  return model.value === props.checkValue
})

const isIndeterminate = computed(() => {
  // When custom function is provided, use it
  if (props.comparatorFn) {
    return props.comparatorFn(model.value, props.indeterminateValue)
  }

  // Otherwise, we just compare the values
  return model.value === props.indeterminateValue
})

const classes = computed(() => {
  return [
    `is-${props.size}`,
    {
      'is-checked': isChecked.value,
      'is-indeterminate': isIndeterminate.value,
      'is-readonly': props.readonly,
      'is-disabled': props.disabled,
    },
  ]
})

function handleStateChange() {
  if (props.readonly || props.disabled) {
    return
  }

  // When using array, we need to toggle the value inside the array
  if (Array.isArray(model.value)) {
    const index = model.value.indexOf(props.checkValue)

    if (index === -1) {
      model.value = [...model.value, props.checkValue]
    } else {
      model.value = model.value.filter(value => value !== props.checkValue)
    }
  }

  // Otherwise, we just set the value
  else {
    if (isChecked.value) {
      model.value = props.uncheckValue
    } else if (isIndeterminate.value) {
      model.value = props.checkValue
    } else {
      model.value = props.indeterminate ? props.indeterminateValue : props.checkValue
    }
  }
}

function handleKey(ev: KeyboardEvent) {
  if (props.readonly || props.disabled) {
    return
  }

  if (ev.key === ' ') {
    ev.preventDefault?.()
    ev.stopPropagation?.()

    handleStateChange()
  }

  props.inputProps?.onKeydown?.(ev)
}

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: CHECKBOX_DEFAULT_PROPS.ui.containerClass({
      size: props.size ?? 'md',
    }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - checkbox
const checkboxClass = computed(() => {
  return mergedProps.value?.ui?.checkboxClass?.({
    defaults: CHECKBOX_DEFAULT_PROPS.ui.checkboxClass({
      size: props.size ?? 'md',
      color: props.color ?? 'primary',
    }),
  })
})

const checkboxStyle = computed(() => {
  return mergedProps.value?.ui?.checkboxStyle?.()
})

// Styles - label
const labelClassComputed = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: CHECKBOX_DEFAULT_PROPS.ui.labelClass({
      size: props.size ?? 'md',
    }),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})

// Styles - focus helper
const focusHelperClass = computed(() => {
  return mergedProps.value?.ui?.focusHelperClass?.({
    defaults: CHECKBOX_DEFAULT_PROPS.ui.focusHelperClass(),
  })
})

const focusHelperStyle = computed(() => {
  return mergedProps.value?.ui?.focusHelperStyle?.()
})
</script>

<template>
  <label
    ref="labelEl"
    tabindex="0"
    class="checkbox__container group"
    :class="[classes, containerClass]"
    :style="containerStyle"
    @keydown="handleKey"
    @click.stop.prevent="handleStateChange"
  >
    <input
      type="checkbox"
      hidden
      tabindex="-1"
      :name="name"
      :checked="isChecked"
      :indeterminate="isIndeterminate"
    >

    <div
      class="checkbox"
      :class="[`is-${color}`, checkboxClass]"
      :style="checkboxStyle"
    >
      <Checkmark
        :class="{ hidden: !isChecked }"
        h="auto"
        w="auto"
        m="1px"
        stroke-color="stroke-white"
      />

      <Indeterminate
        :class="{ hidden: !isIndeterminate }"
        h="auto"
        w="auto"
        m="1px"
        stroke-color="stroke-white"
      />
    </div>

    <slot>
      <span
        v-if="label"
        class="checkbox-label"
        :class="[labelClassComputed, props.labelClass]"
        :style="labelStyle"
      >
        {{ label }}
      </span>
    </slot>

    <slot name="append" />

    <!-- Hover focus helper -->
    <span
      v-if="!noHoverEffect && !disabled && !readonly"
      class="checkbox-focus-helper"
      :class="focusHelperClass"
      :style="focusHelperStyle"
      tabindex="-1"
    />
  </label>
</template>

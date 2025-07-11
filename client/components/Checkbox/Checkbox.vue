<script setup lang="ts">
import type { CSSProperties } from 'vue'

// Types
import type { ICheckboxProps } from './types/checkbox-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<ICheckboxProps>(), {
  ...getComponentProps('checkbox'),
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

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
    return props.comparatorFn(props.modelValue, props.checkValue)
  }

  // When using array, we check if the value is inside the array
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.checkValue)
  }

  // Otherwise, we just compare the values
  return props.modelValue === props.checkValue
})

const isIndeterminate = computed(() => {
  // When custom function is provided, use it
  if (props.comparatorFn) {
    return props.comparatorFn(props.modelValue, props.indeterminateValue)
  }

  // Otherwise, we just compare the values
  return props.modelValue === props.indeterminateValue
})

const state = computed(() => {
  return isChecked.value
    ? 'checked'
    : isIndeterminate.value ? 'indeterminate' : 'unchecked'
})

const toggleState = computed(() => {
  const checkboxClass = mergedProps.value.ui?.checkboxClass?.(state.value)
  const checkboxStyle = mergedProps.value.ui?.checkboxStyle?.(state.value)
  const labelClass = mergedProps.value.ui?.labelClass?.(state.value)
  const labelStyle = mergedProps.value.ui?.labelStyle?.(state.value)

  return {
    checked: !isIndeterminate.value ? isChecked.value : undefined,
    indeterminate: isIndeterminate.value || undefined,
    checkboxClass,
    labelClass: [labelClass, props.labelClass],
    checkboxStyle,
    labelStyle,
  }
})

function handleStateChange() {
  if (!props.editable) {
    return
  }

  // When using array, we need to toggle the value inside the array
  if (Array.isArray(model.value)) {
    const index = model.value.indexOf(props.checkValue)

    if (index === -1) {
      emits('update:modelValue', [...model.value, props.checkValue])
    } else {
      emits(
        'update:modelValue',
        model.value.filter(value => value !== props.checkValue),
      )
    }
  }

  // Otherwise, we just set the value
  else {
    if (toggleState.value.checked) {
      emits('update:modelValue', props.uncheckValue)
    } else if (toggleState.value.indeterminate) {
      emits('update:modelValue', props.checkValue)
    } else {
      emits(
        'update:modelValue',
        props.indeterminate ? props.indeterminateValue : props.checkValue,
      )
    }
  }
}

function handleKey(ev: KeyboardEvent) {
  if (!props.editable) {
    return
  }

  if (ev.key === ' ') {
    ev.preventDefault?.()
    ev.stopPropagation?.()

    handleStateChange()
  }

  props.inputProps?.onKeydown?.(ev)
}
</script>

<template>
  <label
    ref="labelEl"
    tabindex="0"
    class="label"
    :class="[
      `is-${size}`,
      {
        'is-checked': toggleState.checked,
        'is-indeterminate': toggleState.indeterminate,
        'is-readonly': !editable,
        'no-hover-effect': noHoverEffect,
      },
    ]"
    :style="toggleState.labelStyle"
    @keydown="handleKey"
    @click.stop.prevent="handleStateChange"
  >
    <input
      type="checkbox"
      hidden
      tabindex="-1"
      :name="name"
      v-bind="toggleState"
    >

    <div
      class="checkbox"
      :class="[
        `is-${color}`,
        { 'is-readonly': !editable },
        toggleState.checkboxClass,
      ]"
      :style="toggleState.checkboxStyle"
    >
      <Checkmark
        :class="{ hidden: !toggleState.checked }"
        h="auto"
        w="auto"
        m="1px"
        stroke-color="stroke-white"
      />

      <Indeterminate
        :class="{ hidden: !toggleState.indeterminate }"
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
        :class="toggleState.labelClass"
      >
        {{ label }}
      </span>
    </slot>

    <slot name="append" />
  </label>
</template>

<style lang="scss" scoped>
.label {
  @apply flex items-center relative gap-2 cursor-pointer transition-all
    rounded-custom select-none rounded-2;

  @apply '!outline-none';

  .checkbox {
    @apply self-start;
  }

  &:focus-visible,
  &:focus {
    .checkbox {
      @apply ring-2 ring-primary/50 ring-offset-2;
    }
  }

  &.is-readonly {
    @apply opacity-80;
  }

  &:not(.is-checked):not(.is-indeterminate) {
    .checkbox {
      @apply bg-transparent;
    }
  }

  &.is-xs {
    @apply min-h-6 p-x-5px;

    .checkbox {
      @apply h-3.5 w-3.5 rounded-1 m-t-5px;
    }

    .checkbox-label {
      @apply font-rem-13 p-y-1;
    }
  }

  &.is-sm {
    @apply min-h-8 p-x-7px;

    .checkbox {
      @apply h-4.5 w-4.5 rounded-1 m-t-7px;
    }

    .checkbox-label {
      @apply font-rem-14 p-t-7px p-b-6px;
    }
  }

  &.is-md {
    @apply min-h-10 p-x-9px;

    .checkbox {
      @apply h-5.5 w-5.5 rounded-1.5 m-t-9px;
    }

    .checkbox-label {
      @apply p-y-8px;
    }
  }

  &.is-lg {
    @apply min-h-12 p-x-3;

    .checkbox {
      @apply h-6 w-6 rounded-1.5 m-t-12px;
    }

    .checkbox-label {
      @apply font-rem-18 p-y-10px;
    }
  }
}

.checkbox {
  @apply flex flex-center rounded-2 border-primary border-2 shrink-0
    self-start;

  &-label {
    @apply leading-tight;
  }

  &.is-primary {
    @apply bg-primary border-primary;
  }

  &.is-secondary {
    @apply bg-secondary border-secondary;
  }

  &.is-positive {
    @apply bg-positive border-positive;
  }

  &.is-warning {
    @apply bg-warning border-warning;
  }

  &.is-negative {
    @apply bg-negative border-negative;
  }

  &.is-info {
    @apply bg-info border-info;
  }

  &.is-light {
    @apply bg-light border-light;
  }

  &.is-dark {
    @apply bg-dark border-dark;
  }

  &.is-darker {
    @apply bg-darker border-darker;
  }

  &.is-readonly {
    @apply bg-true-gray border-true-gray;
  }

  &.is-sm {
    @apply h-5 w-5;
  }

  &.is-md {
    @apply h-6 w-6;
  }

  &.is-lg {
    @apply h-9 w-9;
  }
}

// .focus-helper {
//   @apply content-empty absolute inset-0 hover:bg-current hover:opacity-10 cursor-pointer
//     rounded-inherit;
// }

.label:not(.no-hover-effect):hover::before {
  @apply content-empty absolute inset-0 bg-current opacity-10 cursor-pointer
    rounded-inherit pointer-events-none;
}
</style>

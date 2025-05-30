<script setup lang="ts">
// Types
import type { IInputWrapperProps } from './types/input-wrapper-props.type'

// Functions
import { useInputWrapperUtils } from '../Inputs/functions/useInputWrapperUtils'
import { useInputValidationUtils } from '../Inputs/functions/useInputValidationUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Components
import InputWrapperInline from './InputWrapperInline.vue'
import InputWrapperInside from './InputWrapperInside.vue'
import InputWrapperRegular from './InputWrapperRegular.vue'

const props = withDefaults(defineProps<IInputWrapperProps>(), {
  ...getComponentProps('inputWrapper'),
})

defineEmits<{
  (e: 'label-click', ev: MouseEvent): void
}>()

// Utils
const { getInputWrapperStyleVariables } = useInputWrapperUtils()
const { issues, isRequired } = useInputValidationUtils(props)

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('inputWrapper', props)
})

// Layout
const wrapperEl = ref<HTMLDivElement>()

const isModified = computed(() => {
  if (!props.originalValue) {
    return false
  }

  return !isEqual(props.originalValue, props.modelValue)
})

const labelProps = computed(() => {
  return {
    activeLabelColor: props.activeLabelColor,
    hasContent: props.hasContent,
    hasError: !!issues.value.length,
    id: props.id,
    label: props.label,
    layout: props.layout,
    placeholder: props.placeholder,
    required: props.required,
    size: props.size,
    stackLabel: props.stackLabel,
    ui: mergedProps.value.ui,
  }
})

const wrapperClass = computed(() => {
  return [
    `wrapper--${props.size}`,
    props.cursor,
    {
      'has-content': props.hasContent,
      'has-label-inside': props.layout === 'label-inside',
      'is-inline': props.layout === 'inline',
    },
  ]
})

const contentClass = computed(() => {
  return {
    'is-readonly': props.readonly,
    'is-disabled': props.disabled,
    'has-error': !!issues.value.length,
    'has-label': !!props.label,
    'is-modified': isModified.value,
  }
})

const wrapperStyleVariables = computed(() => {
  return getInputWrapperStyleVariables({ ...props, ...mergedProps.value })
})

const isInputRequired = computed(() => {
  if (!isNil(props.required)) {
    return props.required
  }

  return isRequired.value
})

// Wrapper
const WrapperComponent = computed(() => {
  switch (props.layout) {
    case 'inline':
      return InputWrapperInline

    case 'label-inside':
      return InputWrapperInside

    default:
      return InputWrapperRegular
  }
})

const wrapperProps = computed(() => {
  return {
    noBorder: props.noBorder,
    readonly: props.readonly,
    disabled: props.disabled,
    hasErrors: !!issues.value.length,
    hint: props.hint,
    size: props.size,
    hasLabel: !!props.label,
    ui: mergedProps.value.ui,
  }
})
</script>

<template>
  <div
    ref="wrapperEl"
    class="wrapper"
    :class="wrapperClass"
    :style="wrapperStyleVariables"
    data-cy="input-field"
  >
    <Component
      :is="WrapperComponent"
      v-bind="wrapperProps"
      class="wrapper__body"
      :class="[contentClass, mergedProps.ui?.contentClass]"
      :style="mergedProps.ui?.contentStyle"
    >
      <!-- Label -->
      <template
        v-if="label"
        #label
      >
        <slot
          name="label"
          :label-props
          :required="isInputRequired"
        >
          <InputLabel
            v-bind="labelProps"
            :required="isInputRequired"
            @click="$emit('label-click', $event)"
          />
        </slot>
      </template>

      <!-- Prepend -->
      <template
        v-if="$slots.prepend"
        #prepend
      >
        <slot name="prepend" />
      </template>

      <!-- Input -->
      <template #input>
        <slot />
      </template>

      <!-- Loading -->
      <template
        v-if="loading"
        #loading
      >
        <LoaderBlock
          size="h-5 w-5"
          class="loading"
        />
      </template>

      <!-- Append -->
      <template
        v-if="$slots.append"
        #append
      >
        <slot name="append" />
      </template>

      <!-- Error -->
      <template
        v-if="errorVisible && issues?.length"
        #error
      >
        <InputErrorContainer
          :error-takes-space
          :errors="issues"
          class="wrapper-error"
        />
      </template>

      <!-- Hint -->
      <template
        v-if="hint || $slots.hint"
        #hint
      >
        <slot name="hint">
          <InputHintContainer
            v-if="hint"
            :hint
          />
        </slot>
      </template>
    </Component>

    <!-- Marker -->
    <div
      v-if="marker"
      class="marker"
      :class="marker?.color ?? 'bg-primary'"
    >
      <Tooltip>
        {{ marker?.text }}
      </Tooltip>
    </div>

    <slot name="menu" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  @apply relative flex flex-col rounded-$borderRadius;

  .wrapper__body {
    @apply relative;
    margin: var(--bodyMargin);

    &.is-readonly,
    &.is-disabled {
      :slotted(.control) {
        @apply cursor-default;
      }

      &::after {
        @apply border-dashed;
      }
    }

    :slotted(.control) {
      @apply bg-inherit outline-none rounded-$borderRadius;

      font-size: var(--fontSize);
      line-height: var(--lineHeight);
      padding: var(--padding);
      margin: var(--margin);
    }
  }

  &:not(.has-content) {
    :slotted(.control) {
      @apply color-true-gray-400;
    }

    &:not(:focus-within) {
      :slotted(.control) {
        @apply '!color-transparent';
      }
    }
  }

  .marker {
    @apply cursor-help z-15 absolute top-1 right-2 w-2 h-2 rounded-full;
  }
}
</style>

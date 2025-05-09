<script setup lang="ts">
// Types
import type { IFieldProps } from './types/field-props.type'

// Functions
import { useFieldUtils } from './functions/useFieldUtils'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'
import { useInputWrapperUtils } from '../Inputs/functions/useInputWrapperUtils'
import { useInputValidationUtils } from '../Inputs/functions/useInputValidationUtils'

const props = withDefaults(defineProps<IFieldProps>(), {
  ...getComponentProps('field'),
})

defineEmits<{
  (e: 'focus', ev: FocusEvent | MouseEvent): void
}>()

// Utils
const { el, inputId } = useFieldUtils()
const { path } = useInputValidationUtils(props)
const { getInputWrapperProps } = useInputWrapperUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('field', props)
})

// Wrapper
const wrapperProps = getInputWrapperProps(props)

const hasContent = computed(() => {
  if (props.noContent) {
    return false
  }

  if (!isNil(props.hasContent)) {
    return props.hasContent
  }

  return props.placeholder || !!props.modelValue
})

defineExpose({
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :ui="mergedProps.ui"
    error-visible
    :has-content
  >
    <!-- Label -->
    <template #label="labelProps">
      <slot
        name="label"
        v-bind="labelProps"
      />
    </template>

    <!-- Prepend -->
    <template
      v-if="$slots.prepend"
      #prepend
    >
      <slot name="prepend" />
    </template>

    <span
      :id="inputId"
      ref="el"
      class="control w-full"
      :class="[
        mergedProps.ui?.inputClass,
        { 'is-placeholder': !hasContent && placeholder },
      ]"
      :style="mergedProps.ui?.inputStyle"
      tabindex="0"
      :readonly
      :disabled
      :data-placeholder="placeholder"
      :name="name || path || label || placeholder"
      @focus="$emit('focus', $event)"
    >
      <slot />
    </span>

    <!-- Append -->
    <template
      v-if="$slots.append || (!readonly && !disabled)"
      #append
    >
      <div
        flex="~ center"
        fit
        @click="$emit('focus', $event)"
      >
        <slot name="append" />
      </div>
    </template>
  </InputWrapper>
</template>

<style scoped lang="scss">
.is-placeholder {
  @apply relative;

  &::after {
    @apply absolute top-0 bottom-0 color-[#9ca3af] flex items-center;

    content: attr(data-placeholder);
  }
}

.wrapper {
  &--sm {
    :deep(.input-wrapper__input) {
      @apply min-h-8;
    }
  }

  &--md {
    :deep(.input-wrapper__input) {
      @apply min-h-10;
    }
  }

  &--lg {
    :deep(.input-wrapper__input) {
      @apply min-h-12;
    }
  }
}
</style>

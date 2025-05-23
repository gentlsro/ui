<script setup lang="ts">
// Types
import type { ITextInputProps } from './types/text-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

const props = withDefaults(defineProps<ITextInputProps>(), {
  ...getComponentProps('textInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: string | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
  (e: 'enter', event: KeyboardEvent): void
  (e: 'clear'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('textInput', props)
})

// Layout
const {
  el,
  inputId,
  masked,
  typed,
  wrapperProps,
  hasContent,
  isBlurred,
  hasClearableBtn,
  label,
  handleBlur,
  handleClickWrapper,
  handleFocusOrClick,
  focus,
  select,
  blur,
  clear,
  getInputElement,
} = useInputUtils({
  props,
  maskRef: toRef(props, 'mask'),
  maskEventHandlers: props.maskEventHandlers,
})

const hasCopyBtn = computed(() => {
  return props.readonly && !props.disabled && !props.noCopy && hasContent.value
})

// Validations
const { path } = useInputValidationUtils(props)

defineExpose({
  focus,
  select,
  blur,
  clear,
  getInputElement,
  sync: (val: any) => typed.value = val,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :ui="mergedProps.ui"
    :has-content
    .focus="focus"
    @click="handleClickWrapper"
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
      <slot
        name="prepend"
        :clear="clear"
        :focus="focus"
      />
    </template>

    <input
      :id="inputId"
      ref="el"
      :value="masked"
      flex="1"
      :type
      :inputmode
      :placeholder
      :readonly
      :disabled
      autocomplete="off"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      role="presentation"
      :class="[ui?.inputClass, { 'custom-enter': !!customEnter }]"
      :style="ui?.inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
      @keypress.enter="$emit('enter', $event)"
    >

    <!-- Hint -->
    <template #hint>
      <slot name="hint" />
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasCopyBtn || clearable"
      #append
    >
      <div :class="mergedProps.ui?.appendClass">
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <InputClearBtn
          v-if="hasClearableBtn"
          :clear-confirmation
          :size
          @click.stop.prevent="!clearConfirmation && clear()"
        />

        <CopyBtn
          v-if="hasCopyBtn"
          :size="size"
          :model-value="masked"
        />
      </div>
    </template>

    <!-- Tooltip -->
    <Menu
      v-if="tooltip || !!$slots.tooltip"
      :model-value="!isBlurred"
      manual
      placement="right"
      :fallback-placements="['bottom']"
      :reference-target="el"
      :no-arrow="false"
      no-uplift
      v-bind="tooltipProps"
    >
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </Menu>
  </InputWrapper>
</template>

<script setup lang="ts">
// Types
import type { ITextInputProps } from './types/text-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

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
const wrapperEl = ref<HTMLDivElement>()
const readonly = toRef(props, 'readonly')
const isValueTemporaryVisible = ref(false)

const wrapperElDom = computed(() => {
  return unrefElement(wrapperEl.value)
})

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
  isTouched,
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

const eyeBtnProps = computed(() => {
  const _props = {
    size: 'auto',
    color: 'ca',
    icon: isValueTemporaryVisible.value ? 'i-eva:eye-fill' : 'i-eva:eye-off-fill',
    tabindex: '-1',
  } as IBtnProps

  switch (props.size) {
    case 'sm':
      _props.icon += ' w-4 h-4'

      break

    case 'md':
      _props.icon += ' w-4.5 h-4.5'

      break

    case 'lg':
      _props.icon += ' w-6 h-6'

      break

    default:
      _props.icon += ' w-4.5 h-4.5'

      break
  }

  return _props
})

const hasCopyBtn = computed(() => {
  return props.readonly && !props.disabled && !props.noCopy && hasContent.value
})

const inputType = computed(() => {
  return props.inputType || props.type
})

// Wrapper class
const wrapperClass = computed(() => {
  return !isBlurred.value ? 'is-focused' : ''
})

// Styles - append
const appendClass = computed(() => {
  return mergedProps.value.ui?.appendClass?.({
    defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui.appendClass(),
  })
})

// Styles - append
const appendStyle = computed(() => {
  return mergedProps.value.ui?.appendStyle?.()
})

// Validations
const { path } = useInputValidationUtils(props)

defineExpose({
  isTouched: () => isTouched.value,
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
    ref="wrapperEl"
    :ui="mergedProps.ui"
    :class="wrapperClass"
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

    <template #default="{ inputClass, inputStyle }">
      <input
        :id="inputId"
        ref="el"
        :value="masked"
        flex="1"
        :type="isValueTemporaryVisible ? 'text' : inputType"
        :inputmode
        :placeholder
        :readonly
        :disabled
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :label="label || placeholder"
        :name="name || path || label || placeholder"
        class="control"
        role="presentation"
        :class="[inputClass, { 'custom-enter': !!customEnter }]"
        :style="inputStyle"
        v-bind="inputProps"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
        @keypress.enter="$emit('enter', $event)"
      >

      <!-- Tooltip -->
      <Menu
        v-if="tooltip || !!$slots.tooltip"
        :model-value="!isBlurred"
        manual
        placement="right"
        :fallback-placements="['bottom']"
        :reference-target="wrapperElDom"
        :no-arrow="false"
        no-uplift
        v-bind="tooltipProps"
      >
        <slot name="tooltip">
          {{ tooltip }}
        </slot>
      </Menu>
    </template>

    <!-- Hint -->
    <template #hint>
      <slot name="hint" />
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasCopyBtn || clearable || inputType === 'password'"
      #append
    >
      <div
        :class="appendClass"
        :style="appendStyle"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <Btn
          v-if="inputType === 'password'"
          v-bind="eyeBtnProps"
          @click="isValueTemporaryVisible = !isValueTemporaryVisible"
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
  </InputWrapper>
</template>

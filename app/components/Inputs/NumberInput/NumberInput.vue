<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { INumberInputProps } from './types/number-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<INumberInputProps>(), {
  ...getComponentProps('numberInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'clear'): void
  (e: 'enter', event: KeyboardEvent): void
}>()

// Utils
const { separators, parseNumber } = useNumber()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('numberInput', props)
})

// Mask
// `exact`: the number as written in data (JSON), whatever the locale: no grouping, `.` as the decimal separator and
// every fraction digit a JS number keeps
const EXACT_SCALE = 20

const mask = computed<MaskedNumber>(() => {
  let mask = new MaskedNumber({
    thousandsSeparator: props.noGrouping || props.exact
      ? ''
      : separators.value.thousandSeparator,
    radix: props.exact ? '.' : separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    scale: props.exact ? EXACT_SCALE : props.fractionDigits,
    mask: Number,
    min: props.min,
    max: props.max,
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      return MaskedNumber.DEFAULTS.format(value)
    },
  })

  if (props.mask) {
    mask = props.mask as MaskedNumber
  }

  return props.formatMask?.({
    mask,
    props: { ...props, ...mergedProps.value },
  }) ?? mask
})

const {
  el,
  inputId,
  model,
  originalModel,
  masked,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
  label,
  isTouched,
  isBlurred,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
  handleKeydown,
} = useInputUtils({
  props,
  maskRef: mask,
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

// Validation
const { path } = useInputValidationUtils(props)

// Layout
const readonly = toRef(props, 'readonly')

// A cell leaves out the step buttons
const hasStep = computed(() => {
  return !!props.step && props.variant !== 'cell' && !readonly.value && !props.disabled
})

function handlePaste(ev: ClipboardEvent) {
  const pastedText = ev.clipboardData?.getData('text')
  const parsedValue = props.exact ? parseExactNumber(pastedText) : parseNumber(pastedText)

  if (!isNil(parsedValue)) {
    model.value = parsedValue
  }
}

function parseExactNumber(text?: string) {
  const value = Number(text?.trim().replace(',', '.'))

  return text?.trim() && Number.isFinite(value) ? value : undefined
}

defineExpose({
  isTouched: () => isTouched.value,
  focus,
  select,
  blur,
  clear,
  getInputElement,
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :class="wrapperClass"
    :has-content="!hasNoValue"
    :ui="mergedProps.ui"
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

    <template #default="{ inputClass, inputStyle, ariaProps }">
      <input
        :id="inputId"
        ref="el"
        flex="1"
        :value="masked"
        :inputmode="exact ? 'decimal' : 'numeric'"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :name="name || path || label || placeholder"
        class="control"
        :class="inputClass"
        :style="inputStyle"
        v-bind="{ ...ariaProps, ...inputProps }"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @paste.stop.prevent="handlePaste"
        @keypress.enter="$emit('enter', $event)"
      >
    </template>

    <!-- Hint -->
    <template #hint>
      <slot name="hint" />
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="hasStep || hasClearableBtn || $slots.append"
        :class="appendClass"
        :style="appendStyle"
        data-cy="offset-buttons"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <InputClearBtn
          v-if="hasClearableBtn"
          :clear-confirmation
          :size
          @clear="clear()"
        />

        <!-- Step -->
        <NumberInputStep
          v-if="hasStep"
          v-bind="props"
          v-model="originalModel"
        />
      </div>
    </template>
  </InputWrapper>
</template>

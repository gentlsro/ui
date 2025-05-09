<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { INumberInputProps } from './types/number-input-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

const props = withDefaults(defineProps<INumberInputProps>(), {
  ...getComponentProps('numberInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'clear'): void
}>()

// Utils
const { separators, parseNumber } = useNumber()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('numberInput', props)
})

// Mask
const mask = computed<MaskedNumber>(() => {
  if (props.mask) {
    return props.mask as MaskedNumber
  }

  return new MaskedNumber({
    thousandsSeparator: props.noGrouping
      ? ''
      : separators.value.thousandSeparator,
    radix: separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    scale: props.fractionDigits,
    mask: Number,
    min: props.min,
    max: props.max,
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      return value.toString()
    },
  })
})

const {
  el,
  inputId,
  model,
  masked,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
  label,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
} = useInputUtils({
  props,
  maskRef: mask,
})

// Validation
const { path } = useInputValidationUtils(props)

// Layout
function handlePaste(ev: ClipboardEvent) {
  const pastedText = ev.clipboardData?.getData('text')
  const parsedValue = parseNumber(pastedText)

  if (!isNil(parsedValue)) {
    model.value = parsedValue
  }
}

defineExpose({
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

    <input
      :id="inputId"
      ref="el"
      flex="1"
      :value="masked"
      inputmode="numeric"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      role="presentation"
      :class="ui?.inputClass"
      :style="ui?.inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
      @paste.stop.prevent="handlePaste"
    >

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn || (!readonly && !disabled)"
      #append
    >
      <div
        v-if="step || hasClearableBtn || $slots.append"
        class="number-input__append"
        data-cy="offset-buttons"
        @click="handleFocusOrClick"
      >
        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <Btn
          v-if="hasClearableBtn"
          icon="i-eva:close-fill h-6 w-6"
          color="ca"
          size="auto"
          h="7"
          w="7"
          tabindex="-1"
          @click.stop.prevent="!clearConfirmation && clear()"
        >
          <MenuConfirmation
            v-if="clearConfirmation"
            @ok="clear"
          >
            {{ clearConfirmation }}
          </MenuConfirmation>
        </Btn>

        <!-- Step -->
        <NumberInputStep
          v-if="step && !readonly && !disabled"
          v-bind="props"
          v-model="model"
        />
      </div>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.number-input__append {
  @apply flex gap-x-2 flex-center p-x-2;
}
</style>

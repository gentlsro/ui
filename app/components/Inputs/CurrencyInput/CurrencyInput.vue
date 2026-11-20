<script setup lang="ts" vapor>
import { mergeProps } from 'vue'
import { MaskedNumber } from 'imask'

// Types
import type { ICurrencyInputExpose } from './types/currency-input-expose.type'
import type { ICurrencyInputProps } from './types/currency-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { CURRENCY_DEFAULT } from '#layers/utilities/app/i18n'
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<ICurrencyInputProps>(), {
  ...getComponentProps('currencyInput'),
})

const emits = defineEmits<{
  (e: 'clear'): void
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'focus'): void
  (e: 'blur', ev: FocusEvent): void
}>()

// Utils
const { currentLocale } = useLocale()
const { separators } = useNumber()

const mergedProps = computed(() => {
  return getComponentMergedProps('currencyInput', props)
})

// Mask
const mask = computed<MaskedNumber>(() => {
  return new MaskedNumber({
    thousandsSeparator: props.noGrouping
      ? ''
      : separators.value.thousandSeparator,
    radix: separators.value.decimalSeparator,
    mapToRadix: ['.', ','],
    padFractionalZeros: true,
    scale: props.fractionDigits,
    mask: Number,
    min: props.min ?? Number.MIN_SAFE_INTEGER,
    max: props.max ?? Number.MAX_SAFE_INTEGER,
    format: (value: any) => {
      if (isNil(value)) {
        return ''
      }

      const isValidNumber = isNumeric(value)

      if (!isValidNumber) {
        return ''
      }

      return value.toFixed(props.fractionDigits)
    },
  })
})

// Layout
const readonly = toRef(props, 'readonly')

const {
  el,
  inputId,
  model,
  masked,
  typed,
  setTypedValue,
  wrapperProps,
  hasNoValue,
  hasClearableBtn,
  label,
  isTouched,
  focus,
  select,
  blur,
  clear,
  getInputElement,
  handleClickWrapper,
  handleFocusOrClick,
  handleBlur,
  handleKeydown,
  isBlurred,
} = useInputUtils({
  emit: emits,
  props,
  maskRef: mask,
})

const { path } = useInputValidationUtils(props)

const isEditable = computed(() => !props.readonly && !props.disabled)

// Input handling: typing at the end fills the amount from the cents (3, 0 gives 0.30), as a till does.
// IMask represents both signs of zero as 0 between keystrokes.
let negativeZero = false

// A blur or an emptied field (Backspace, the clear button) starts the next amount afresh
watch([isBlurred, hasNoValue], ([isBlurred, isEmpty]) => {
  if (isBlurred || isEmpty) {
    negativeZero = false
  }
})

function handleBeforeInput(ev: Event) {
  const input = el.value as HTMLInputElement

  if (!input || !(ev instanceof InputEvent)) {
    return
  }

  const isAllSelected = input.value.length > 0
    && input.selectionStart === 0
    && input.selectionEnd === input.value.length
  const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length

  // Editing in the middle of the value keeps the mask's own editing
  if (!isAllSelected && !isAtEnd) {
    negativeZero = false

    return
  }

  const current = isAllSelected || isNil(typed.value) ? 0 : Number(typed.value)
  const scale = 10 ** props.fractionDigits
  const minorUnits = Math.round(Math.abs(current) * scale)
  const sign = current < 0 || (current === 0 && negativeZero) ? -1 : 1

  if (isAllSelected) {
    negativeZero = false
  }

  // Deleting: everything selected empties the field; Backspace at the end drops the last digit and empties the
  // field once no digit is left
  if (!ev.data) {
    if (isAllSelected) {
      setTypedValue(props.emptyValue)
    } else if (ev.inputType === 'deleteContentBackward') {
      const next = Math.trunc(minorUnits / 10)

      setTypedValue(next ? sign * next / scale : props.emptyValue)
    } else {
      return
    }
  } else if (ev.data === '-') {
    negativeZero = current === 0 && !negativeZero
    setTypedValue(-current)
  } else if (ev.data.length > 1 && (isAllSelected || !current || ev.data.startsWith('-'))) {
    // Pasting a whole amount (into an empty or selected field) reads it with the locale's separators
    const amount = ev.data
      .replace(/\s/g, '')
      .split(separators.value.thousandSeparator)
      .join('')
      .replace(separators.value.decimalSeparator, '.')

    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount)) {
      return
    }

    setTypedValue(Number(amount))
    negativeZero = amount.startsWith('-') && Number(amount) === 0
  } else if (/^\d+$/.test(ev.data)) {
    // Digits append to the amount in minor units
    const magnitude = Number(`${minorUnits}${ev.data}`) / scale

    setTypedValue(sign * magnitude)
    negativeZero = sign < 0 && magnitude === 0
  } else {
    return
  }

  ev.preventDefault()
  if (!isAllSelected) {
    ev.stopPropagation()
    ev.stopImmediatePropagation()
  }
  nextTick(() => input.setSelectionRange(input.value.length, input.value.length))
}

const currency = computed(() => {
  if (props.noCurrency) {
    return undefined
  }

  if (props.currency || !currentLocale.value) {
    return props.currency ?? CURRENCY_DEFAULT
  }

  return new Intl.NumberFormat(
    currentLocale.value.code,
    { style: 'currency', currency: (currentLocale.value as any).currency },
  )
    .formatToParts(1)
    .find(part => part.type === 'currency')
    ?.value ?? CURRENCY_DEFAULT
})

const currencyVisibility = computed(() => {
  if (!currency.value) {
    return false
  }

  return props.currencyPosition === 'prepend'
    ? 'prepend'
    : 'append'
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

defineExpose({
  isTouched: () => isTouched.value,
  focus,
  select,
  blur,
  clear,
  getInputElement,
} satisfies ICurrencyInputExpose)
</script>

<template>
  <InputWrapper
    v-bind="mergeProps(wrapperProps, $attrs)"
    :id="inputId"
    :class="wrapperClass"
    :has-content="!hasNoValue"
    :ui="mergedProps.ui"
    .focus="focus"
    @click="handleClickWrapper"
  >
    <!-- Label -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
      <slot
        name="label"
        v-bind="labelProps"
      />
    </template>

    <!-- Prepend -->
    <template
      v-if="$slots.prepend || currencyVisibility === 'prepend'"
      #prepend
    >
      <span
        v-if="currencyVisibility === 'prepend'"
        class="currency-input__symbol prepended"
      >
        {{ currency }}
      </span>

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
        inputmode="numeric"
        :placeholder
        :readonly
        :disabled
        :name="name || path || label || placeholder"
        class="control"
        :class="inputClass"
        :style="inputStyle"
        v-bind="{ ...ariaProps, ...inputProps }"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @beforeinput="handleBeforeInput"
      >
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn || (step && isEditable) || currencyVisibility === 'append'"
      #append
    >
      <div
        :class="appendClass"
        :style="appendStyle"
      >
        <span
          v-if="currencyVisibility === 'append'"
          class="currency-input__symbol appended"
        >
          {{ currency }}
        </span>

        <slot
          name="append"
          :clear="clear"
          :focus="focus"
        />

        <!-- Clear button -->
        <Btn
          v-if="hasClearableBtn && isEditable"
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
          v-if="step && isEditable"
          v-bind="props"
          v-model="model"
        />
      </div>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.currency-input__symbol {
  @apply text-caption font-semibold pointer-events-none;

  &.prepended {
    @apply m-l-3;
  }

  &.appended {
    @apply m-r-3;
  }
}
</style>

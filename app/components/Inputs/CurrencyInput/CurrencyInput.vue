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

// Input handling: typing at the end fills the whole part from the right while the fraction stays fixed
// (3, 0, 0 gives 300.00); the decimal separator moves into the fraction, filled from the left (3, ., 5 gives 3.50)
const fraction = ref<{ digits: number } | null>(null)

// IMask represents both signs of zero as 0 between keystrokes.
let negativeZero = false

watch(isBlurred, isBlurred => {
  if (isBlurred) {
    negativeZero = false
    fraction.value = null
  }
})

function setValue(value: number) {
  setTypedValue(value)
  nextTick(() => {
    const input = el.value as HTMLInputElement | undefined

    input?.setSelectionRange(input.value.length, input.value.length)
  })
}

function handleBeforeInput(ev: Event) {
  const input = el.value as HTMLInputElement

  if (!input || !(ev instanceof InputEvent)) {
    return
  }

  const isAllSelected = input.value.length > 0
    && input.selectionStart === 0
    && input.selectionEnd === input.value.length
  const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length

  // Typing in the middle of the value keeps the mask's own editing
  if (!isAllSelected && !isAtEnd) {
    negativeZero = false

    return
  }

  ev.preventDefault()

  const value = isAllSelected || isNil(typed.value) ? 0 : Number(typed.value)
  let sign = value < 0 || (!isAllSelected && value === 0 && negativeZero) ? -1 : 1
  const scale = 10 ** props.fractionDigits
  const whole = Math.trunc(Math.abs(value))
  const cents = Math.round((Math.abs(value) - whole) * scale)

  if (isAllSelected) {
    negativeZero = false
    fraction.value = null
  }

  // Deleting
  if (!ev.data) {
    if (!isAllSelected && ev.inputType !== 'deleteContentBackward') {
      return
    }

    if (isAllSelected) {
      negativeZero = false
      setTypedValue(props.emptyValue)
    } else if (fraction.value?.digits) {
      const digits = --fraction.value.digits
      const kept = Math.trunc(cents / 10 ** (props.fractionDigits - digits)) * 10 ** (props.fractionDigits - digits)

      setValue(sign * (whole + kept / scale))
    } else if (fraction.value) {
      fraction.value = null
    } else {
      setValue(sign * (Math.trunc(whole / 10) + cents / scale))
    }

    return
  }

  let current = value
  for (const char of ev.data) {
    const absolute = Math.abs(current)
    const currentWhole = Math.trunc(absolute)
    const currentCents = Math.round((absolute - currentWhole) * scale)

    if (char === '-') {
      sign = -sign
      current = sign * absolute
    } else if (char === '.' || char === ',') {
      if (props.fractionDigits > 0) {
        fraction.value = { digits: 0 }
      }
    } else if (isNumeric(char)) {
      const digit = Number(char)

      if (fraction.value) {
        if (fraction.value.digits < props.fractionDigits) {
          const position = props.fractionDigits - ++fraction.value.digits
          const nextCents = Math.trunc(currentCents / 10 ** (position + 1)) * 10 ** (position + 1) + digit * 10 ** position

          current = sign * (currentWhole + nextCents / scale)
        }
      } else {
        current = sign * (currentWhole * 10 + digit + currentCents / scale)
      }
    }
  }

  if (/[0-9-]/.test(ev.data)) {
    negativeZero = current === 0 && sign < 0
    setValue(current)
  }
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
        inputmode="decimal"
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

<script setup lang="ts">
import { MaskedNumber } from 'imask'

// Types
import type { ICurrencyInputProps } from './types/currency-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { isNumeric } from '#layers/utilities/shared/functions/is-numeric'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

// Constants
import { CURRENCY_DEFAULT } from '#layers/utilities/shared/i18n'
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<ICurrencyInputProps>(), {
  ...getComponentProps('currencyInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: number | undefined | null): void
  (e: 'blur'): void
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
  isBlurred,
} = useInputUtils({
  props,
  maskRef: mask,
  maskEventHandlers: {
    onAccept: (_, ev, refs) => {
      if (!ev) {
        return
      }

      const input = el.value as HTMLInputElement

      if (!input) {
        return
      }

      if (refs) {
        const [_, decimals] = refs.masked.value.split(separators.value.decimalSeparator)

        // We make sure we have the correct number of fraction digits
        // and recalculate the typed value
        if (!decimals || decimals?.length < props.fractionDigits) {
          const sliceRange = -1 * props.fractionDigits
          const digits = decimals ? props.fractionDigits - decimals.length : props.fractionDigits

          const val = (refs?.typed.value ?? 0).toFixed(digits).replace(/\./g, '')
          const typedValue = Number(`${val.slice(0, sliceRange)}.${val.slice(sliceRange)}`)

          refs.typed.value = typedValue

          // When no decimals are provided, we need to reset the input focus for mask to refresh
          if (!decimals) {
            blur()
            nextTick(() => focus())
          }
        }
      }
    },
  },
})

const { path } = useInputValidationUtils(props)

const isEditable = computed(() => !props.readonly && !props.disabled)

// Input handling
// IMask normalizes negative zero before the next digit arrives.
let negativeZero = false
watch(isBlurred, blurred => {
  if (blurred) {
    negativeZero = false
  }
})

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

function handleBeforeInput(ev: Event) {
  const input = el.value as HTMLInputElement

  if (!input || !(ev instanceof InputEvent)) {
    return
  }

  const isAllSelected = input.selectionStart === 0
    && input.selectionEnd === input.value.length
    && input.value.length > 0

  const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length
  if (!isAllSelected && !isAtEnd) {
    negativeZero = false

    return
  }

  if (isAllSelected) {
    negativeZero = false
  }
  if (!ev.data) {
    negativeZero = false
    if (isAllSelected) {
      typed.value = props.emptyValue
    }

    return
  }

  const current = isAllSelected ? 0 : Number(typed.value ?? 0)
  const scale = 10 ** props.fractionDigits

  if (ev.data === '-') {
    negativeZero = current === 0 && !negativeZero
    typed.value = -current
  } else if (ev.data.length > 1 && (isAllSelected || !current || ev.data.startsWith('-'))) {
    const amount = ev.data.trim().split(separators.value.thousandSeparator).join('')
      .replace(separators.value.decimalSeparator, '.')
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(amount)) {
      return
    }
    typed.value = Number(amount)
    negativeZero = amount.startsWith('-') && typed.value === 0
  } else if (/^\d+$/.test(ev.data)) {
    // This branch uses fixed-point entry: append digits to the amount in minor units.
    const minorUnits = Math.round(Math.abs(current) * scale)
    const magnitude = Number(`${minorUnits}${ev.data}`) / scale
    const sign = current < 0 || (current === 0 && negativeZero) ? -1 : 1
    typed.value = sign * magnitude
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
})
</script>

<template>
  <InputWrapper
    v-bind="wrapperProps"
    :id="inputId"
    :class="wrapperClass"
    :has-content="!hasNoValue"
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

    <template #default="{ inputClass, inputStyle }">
      <input
        :id="inputId"
        ref="el"
        flex="1"
        :value="masked"
        inputmode="numeric"
        :placeholder
        :readonly
        :disabled
        :label="label || placeholder"
        :name="name || path || label || placeholder"
        class="control"
        role="presentation"
        :class="inputClass"
        :style="inputStyle"
        v-bind="inputProps"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
        @beforeinput="handleBeforeInput"
      >
    </template>

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn || step || currencyVisibility === 'append'"
      #append
    >
      <div
        :class="appendClass"
        :style="appendStyle"
        @click="handleFocusOrClick"
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

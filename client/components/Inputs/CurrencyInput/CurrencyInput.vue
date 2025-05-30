<script setup lang="ts">
import { MaskedNumber } from 'imask'
import { isNumeric } from '$utils'

// Types
import type { ICurrencyInputProps } from './types/currency-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

// Constants
import { CURRENCY_DEFAULT } from '$utilsLayer/shared/i18n'

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
    min: props.min,
    max: props.max,
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
const {
  el,
  inputId,
  model,
  masked,
  typed,
  unmasked,
  wrapperProps,
  hasNoValue,
  lastValidValue,
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
const ALLOWED_CHARS = /[0-9-]/

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

  const isAtEnd = input.selectionStart === input.value.length

  // When the entire text is selected and we're adding a digit, we need to
  // initialize the value to `0.0` and add the digit
  if (isAllSelected && ev.data) {
    if (ev.data.length === 1 && isNumeric(ev.data)) {
      typed.value = Number(`0.0${ev.data}`)
    } else if (ev.data.length === 1 && ev.data === '-') {
      typed.value = typed.value * -1
    }
  }

  // When the entire text is selected and we're not providing any data (for example backspace/delete),
  // we reset the value to the `emptyValue`
  else if (isAllSelected) {
    typed.value = props.emptyValue
  }

  // When providing data (typing or pasting) while we are at the end of the input,
  // we "shift" the value to the right and add the new digit
  else if (ev.data && isAtEnd) {
    if (!ALLOWED_CHARS.test(ev.data)) {
      return
    }

    const isValNumeric = isNumeric(ev.data)
    const sliceRange = -1 * props.fractionDigits
    let val = (lastValidValue.value ?? 0).toFixed(props.fractionDigits).replace(/\./g, '')

    if (isValNumeric) {
      val += ev.data
    }

    val = Number(`${val.slice(0, sliceRange)}.${val.slice(sliceRange)}`)

    // Handle negative values
    const isMinus = ev.data === '-'

    // When the `masked` value has been preset to `-0.00` and the input is a numeric value,
    // we set the value and negate it
    if (unmasked.value === '-0' && isValNumeric) {
      val = val * -1
    }

    // When input is `-` and the value is `0`, we preset the `masked` value to `-0.00`
    else if (val === 0 && isMinus) {
      masked.value = '-0.00'

      return
    }

    // When input is `-` and the value is not `0`, we negate the value
    else if (val !== 0 && isMinus) {
      val = val * -1
    }

    // When inputting an actual 0
    else if (val === 0) {
      masked.value = '0.00'

      return
    }

    typed.value = val

    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
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
      :class="mergedProps.ui?.inputClass"
      :style="mergedProps.ui?.inputStyle"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
      @beforeinput="handleBeforeInput"
    >

    <!-- Append -->
    <template
      v-if="$slots.append || hasClearableBtn || step || currencyVisibility === 'append'"
      #append
    >
      <div
        class="currency-input__append"
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
.currency-input__append {
  @apply flex gap-x-2 flex-center p-x-2;
}

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

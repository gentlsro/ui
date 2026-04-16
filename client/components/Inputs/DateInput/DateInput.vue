<script setup lang="ts">
import type { Dayjs } from 'dayjs'

import { MaskedRange } from 'imask'
import type { FactoryOpts } from 'imask'

// Types
import type { IDateInputProps } from './types/date-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'

const props = withDefaults(defineProps<IDateInputProps>(), {
  ...getComponentProps('dateInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: Datetime): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'clear'): void
}>()

// Utils
const { getCurrentLocaleDateFormat } = useLocale()
const { formatDate, parseDate } = useDateUtils()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('dateInput', props)
})

function isDate(date?: any) {
  if (date === '' || isNil(date) || date === props.emptyValue) {
    return false
  }

  return true
}

// Mask
const PATTERN = computed(() => getCurrentLocaleDateFormat())

const mask = computed<FactoryOpts>(() => {
  return {
    mask: PATTERN.value,
    pattern: PATTERN.value,
    lazy: false,
    overwrite: true,
    blocks: {
      DD: {
        mask: MaskedRange,
        placeholderChar: 'D',
        autofix: 'pad',
        from: 1,
        to: 31,
        maxLength: 2,
      },
      MM: {
        mask: MaskedRange,
        placeholderChar: 'M',
        autofix: 'pad',
        from: 1,
        to: 12,
        maxLength: 2,
      },
      YYYY: {
        mask: MaskedRange,
        placeholderChar: 'Y',
        autofix: 'pad',
        from: 1900,
        to: 2999,
        maxLength: 4,
      },
    },
    format: (val: any) => {
      if (!isDate(val)) {
        return PATTERN.value
      }
      if (isMaskString(val)) {
        return val
      }

      if (props.utc) {
        return formatDate(val, 'utc')
      } else {
        return formatDate(val)
      }
    },
    parse: (val: any) => {
      if (!isDate(val)) {
        return props.emptyValue
      }
      if (isMaskString(val)) {
        return val
      }

      const parsedDate = parseDate(val, { isLocalString: true }).format('YYYY-MM-DD')

      return props.format
        ? $date(parsedDate, { utc: props.utc }).format(props.format)
        : $date(parsedDate, { utc: props.utc })
    },
  }
})

function isMaskString(val?: string) {
  return val === PATTERN.value
}

// Layout
const preventSync = autoResetRef(false, 50)

function handleDateSelect(val: Dayjs) {
  preventSync.value = true
  model.value = props.format ? val.format(props.format) : val

  if (props.autoClose) {
    menuProxyEl.value?.hide()
  }
}

// Picker
const menuProxyEl = useTemplateRef('menuProxyEl')
const datePickerEl = useTemplateRef('datePickerEl')
const isPickerActive = ref(false)

function handlePickerIconClick(ev: MouseEvent) {
  if (isPickerActive.value) {
    ev.preventDefault()
    ev.stopPropagation()

    return
  }

  isPickerActive.value = true
}

const {
  el,
  inputId,
  model,
  masked,
  wrapperProps,
  hasNoValue,
  hasContent,
  hasClearableBtn,
  label,
  isTouched,
  handleFocusOrClick,
  handleClickWrapper,
  focus,
  select,
  handleBlur,
  blur,
  clear,
  getInputElement,
} = useInputUtils({
  props,
  maskRef: mask,
  maskEventHandlers: {
    onCompleted: () => {
      if (!preventSync.value) {
        nextTick(() => datePickerEl.value?.sync())
      }
    },
  },
  menuElRef: menuProxyEl,
  preventFocusOnTouch: true,
})

const { path } = useInputValidationUtils(props)

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
    :has-content
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
      type="text"
      :value="masked"
      :placeholder="placeholder"
      :readonly
      :disabled
      autocomplete="off"
      :label="label || placeholder"
      :name="name || path || label || placeholder"
      class="control"
      :class="mergedProps.ui?.inputClass"
      :style="{
        ...mergedProps.ui?.inputStyle,
        ...(hasNoValue && { color: 'var(--placeholder-color)' }),
      }"
      v-bind="inputProps"
      @focus="handleFocusOrClick"
      @blur="handleBlur"
    >

    <!-- Append -->
    <template #append>
      <div
        v-if="$slots.append || (!readonly && !disabled)"
        flex="~ gap-1 center"
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

        <div
          v-if="!noPickerIcon"
          class="picker-icon i-system-uicons:calendar-date"
          @mousedown="handlePickerIconClick"
          @click.stop.prevent
        />
      </div>
    </template>

    <template #menu>
      <MenuProxy
        ref="menuProxyEl"
        v-model="isPickerActive"
        manual
        position="top"
        placement="bottom-start"
        no-uplift
        :fit="false"
        :reference-target="el"
        h="!auto"
        w="!auto"
        min-w="!280px"
        max-w="!400px"
        :ui="{ contentClass: 'p-0' }"
        data-onboarding="date-picker-menu"
      >
        <DatePicker
          ref="datePickerEl"
          :model-value="model"
          :allowed-days
          :disabled-days
          :utc
          @mousedown.stop.prevent
          @update:model-value="handleDateSelect"
        />
      </MenuProxy>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.picker-icon {
  @apply cursor-pointer color-ca m-x-2 h-6 w-6;
}

.input-wrapper {
  &--xs,
  &--sm {
    .picker-icon {
      @apply h-5 w-5;
    }
  }
}
</style>

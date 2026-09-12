<script setup lang="ts">
import type { FactoryOpts } from 'imask'

// Types
import type { IDateTimeFullInputProps } from './types/date-time-full-input-props.type'

// Functions
import { useInputUtils } from '../functions/useInputUtils'
import { useInputValidationUtils } from '../functions/useInputValidationUtils'
import { createDateTimeMask } from './functions/masked-datetime'

// Constants
import { $bp } from '../../../constants/breakpoints'
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<IDateTimeFullInputProps>(), {
  ...getComponentProps('dateTimeFullInput'),
})

defineEmits<{
  (e: 'update:modelValue', val?: Datetime): void
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'clear'): void
}>()

/** Used for the time part when only a day is picked */
const DEFAULT_TIME = '00:00'

// Utils
const { getCurrentLocaleDateFormat } = useLocale()
const { localeUses24HourTime } = useDateUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('dateTimeFullInput', props)
})

// Layout
const readonly = toRef(props, 'readonly')

// The picker is a dialog below this breakpoint – the same one `MenuProxy` uses
const menuBreakpoint = getComponentProps('menuProxy').breakpoint ?? 'sm'
const isCompact = computed(() => !$bp[menuBreakpoint].value)

const is12h = computed(() => !localeUses24HourTime())
const datePattern = computed(() => getCurrentLocaleDateFormat())

function isEmptyValue(val?: any) {
  return val === '' || isNil(val) || isEqual(val, props.emptyValue)
}

/** Builds a `Datetime` out of an ISO date and a stored 24h `HH:mm` time. */
function buildValue(isoDate: string, time: string) {
  const [hh = '00', mm = '00'] = time.split(':')
  const base = props.utc ? $date(isoDate, { utc: true }) : $date(isoDate)

  if (!base.isValid()) {
    return undefined
  }

  return base.hour(Number(hh)).minute(Number(mm)).second(0).millisecond(0)
}

// Mask
const mask = computed<FactoryOpts>(() => {
  return createDateTimeMask({
    datePattern: datePattern.value,
    emptyValue: props.emptyValue,
    is12h: is12h.value,
    fromValue: value => {
      const date = $date(value, { utc: props.utc })

      if (!date.isValid()) {
        return undefined
      }

      return {
        date: date.format(datePattern.value),
        time: date.format('HH:mm'),
      }
    },
    toValue: ({ date, time }) => {
      const parsed = $date(date, datePattern.value)

      if (!parsed.isValid()) {
        return undefined
      }

      return buildValue(parsed.format('YYYY-MM-DD'), time)
    },
  })
})

// Picker
const menuProxyEl = useTemplateRef('menuProxyEl')
const pickerEl = useTemplateRef('pickerEl')
const isPickerActive = ref(false)

// Layout
const preventSync = autoResetRef(false, 50)

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
  isBlurred,
  isTouched,
  handleFocusOrClick,
  handlePointerDown,
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
  preserveValueOnMaskChange: true,
  maskEventHandlers: {
    onCompleted: () => {
      if (!preventSync.value) {
        nextTick(() => pickerEl.value?.sync())
      }
    },
  },
  menuElRef: menuProxyEl,
  preventFocusOnTouch: true,
})

const { path } = useInputValidationUtils(props)

// Value
function getValueDate() {
  if (isEmptyValue(model.value)) {
    return undefined
  }

  const date = $date(model.value, { utc: props.utc })

  return date.isValid() ? date : undefined
}

const dateValue = computed(() => getValueDate()?.format('YYYY-MM-DD'))
const timeValue = computed(() => getValueDate()?.format('HH:mm'))

function setDateTime(payload: { value?: Datetime, valueType: 'date' | 'time' }) {
  const { value, valueType } = payload

  if (!value) {
    model.value = props.emptyValue

    return
  }

  if (valueType === 'date') {
    const isoDate = $date(value, { utc: props.utc }).format('YYYY-MM-DD')

    model.value = buildValue(isoDate, timeValue.value ?? DEFAULT_TIME)

    return
  }

  const isoDate = dateValue.value ?? $date().format('YYYY-MM-DD')

  model.value = buildValue(isoDate, String(value))
}

function handleDateSelect(val?: Datetime) {
  preventSync.value = true
  setDateTime({ value: val, valueType: 'date' })

  if (props.autoClose ?? !isCompact.value) {
    menuProxyEl.value?.hide()

    return
  }

  // On a narrow viewport the time is picked in its own tab – move the user on
  if (isCompact.value) {
    pickerEl.value?.showPane('time')
  }
}

function handleTimeSelect(val?: string) {
  preventSync.value = true
  setDateTime({ value: val, valueType: 'time' })
}

function handleNow() {
  model.value = props.utc ? $date(undefined, { utc: true }) : $date()

  if (props.autoClose ?? !isCompact.value) {
    menuProxyEl.value?.hide()
  }
}

function handleApply() {
  menuProxyEl.value?.hide()
}

function handleClear() {
  clear()
}

function handlePickerShow() {
  nextTick(() => pickerEl.value?.sync())
}

function handlePickerIconClick(ev: MouseEvent) {
  if (isPickerActive.value) {
    ev.preventDefault()
    ev.stopPropagation()

    return
  }

  isPickerActive.value = true
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

    <template #default="{ inputClass, inputStyle }">
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
        :class="inputClass"
        :style="{
          ...inputStyle,
          ...(hasNoValue && { color: 'var(--placeholder-color)' }),
        }"
        v-bind="inputProps"
        @pointerdown="handlePointerDown"
        @focus="handleFocusOrClick"
        @blur="handleBlur"
      >
    </template>

    <!-- Append -->
    <template #append>
      <div
        v-if="$slots.append || (!readonly && !disabled)"
        :class="appendClass"
        :style="appendStyle"
        @click="handleFocusOrClick"
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
          @click.stop.prevent="!clearConfirmation && clear()"
        />

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
        position="center"
        placement="bottom-start"
        no-uplift
        :fit="false"
        :reference-target="el"
        h="!auto"
        w="!auto"
        :max-w="isCompact ? '!92vw' : '!90vw'"
        :ui="{ contentClass: ({ defaults }) => `${defaults.base} !p-0` }"
        data-onboarding="datetime-full-picker-menu"
        @hide="isPickerActive = false"
        @show="handlePickerShow"
      >
        <DateTimeFullInputPicker
          ref="pickerEl"
          :allowed-days
          :disabled-days
          :date-value="dateValue"
          :time-value="timeValue"
          :is-12h
          :is-compact
          :utc
          @apply="handleApply"
          @clear="handleClear"
          @now="handleNow"
          @update:date-value="handleDateSelect"
          @update:time-value="handleTimeSelect"
        />
      </MenuProxy>
    </template>
  </InputWrapper>
</template>

<style lang="scss" scoped>
.control {
  font-variant-numeric: tabular-nums;
}

.picker-icon {
  @apply cursor-pointer color-ca h-6 w-6 group-[.wrapper--sm]/wrapper:(h-4 w-4);
}
</style>

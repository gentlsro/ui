<script setup lang="ts">
// TODO: MIN & MAX

// Types
import type { IYearMonthSelectorProps } from './types/year-month-selector-props.type'

// Functions
import { useFieldUtils } from '../Field/functions/useFieldUtils'
import { getYearMonthModelValue } from './functions/get-year-month-model-value'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../InputWrapper/constants/input-wrapper-default-props'
import { YEAR_MONTH_SELECTOR_DEFAULT_PROPS } from './constants/year-month-selector-default-props.constant'

const props = withDefaults(defineProps<IYearMonthSelectorProps>(), {
  ...getComponentProps('yearMonthSelector'),
})

defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'clear'): void
}>()

// Utils
const { formatDate } = useDateUtils()

const onFocus = props.eventHandlers?.onFocus
const onBeforeFocus = props.eventHandlers?.onBeforeFocus

const mergedProps = computed(() => {
  return getComponentMergedProps('yearMonthSelector', props)
})

// Layout
const fieldEl = useTemplateRef('fieldEl')
const model = defineModel<Datetime>()

const pickerModel = computed<Datetime>({
  get() {
    return model.value
  },
  set(value) {
    if (value === null || value === undefined) {
      model.value = value

      return
    }

    model.value = getYearMonthModelValue({
      date: $date(value, { utc: !!props.utc }),
      valueFormat: props.valueFormat ?? 'timestamp',
    })
  },
})

const modelFormatted = computed(() => {
  if (!model.value) {
    return ''
  }

  /**
   * `year-month` values are plain date strings ~ they carry no time zone, so they
   * are read as-is. Only instants are read in the picker's own frame.
   */
  const isYearMonthString = typeof model.value === 'string' && /^\d{4}-\d{2}$/.test(model.value)
  const format = props.utc && !isYearMonthString ? 'utcYearMonth' : 'yearMonth'

  return capitalize(formatDate(model.value, format))
})

// Picker
const referenceEl = ref<HTMLElement>()
const isPickerActive = ref(false)
const pickerState = ref('hide')
const menuProxyEl = useTemplateRef('menuProxyEl')

function handleMonthSelect() {
  isPickerActive.value = false
  fieldEl.value?.focus()
}

// Field
const {
  el,
  inputId,
  getFieldProps,
  handleFocusOrClick,
  handleClickWrapper,
  handlePointerDown,
  handleBlur,
} = useFieldUtils({
  props,
  menuElRef: menuProxyEl,
  onBeforeFocus: ev => onBeforeFocus?.(ev, isPickerActive) ?? {},
  onFocus: ev => onFocus ? onFocus(ev, isPickerActive) : isPickerActive.value = true,
})

const fieldProps = getFieldProps(props)

const ignoredEls = computed(() => [
  `#${inputId}-wrapper .input-wrapper__focusable`,
])

// Styles - append
const appendClass = computed(() => {
  return mergedProps.value.ui?.appendClass?.({
    defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui.appendClass(),
  })
})

const appendStyle = computed(() => {
  return mergedProps.value.ui?.appendStyle?.()
})

// Styles - picker icon
const pickerIconClass = computed(() => {
  return mergedProps.value.ui?.pickerIconClass?.({
    defaults: YEAR_MONTH_SELECTOR_DEFAULT_PROPS.ui.pickerIconClass(),
  })
})

const pickerIconStyle = computed(() => {
  return mergedProps.value.ui?.pickerIconStyle?.()
})

onMounted(() => {
  nextTick(() => {
    const fieldElDom = unrefElement(fieldEl as any)
    const wrapperElDom = fieldElDom?.querySelector('.input-wrapper-border')

    referenceEl.value = wrapperElDom
  })
})
</script>

<template>
  <Field
    :id="inputId"
    ref="fieldEl"
    v-bind="fieldProps"
    class="year-month-selector group/year-month-selector"
    :class="{ 'is-readonly': readonly, 'is-disabled': disabled }"
    :ui="mergedProps.ui"
    :has-content="!!model"
    .focus="handleFocusOrClick"
    @pointerdown="handlePointerDown"
    @click="handleClickWrapper"
    @focus="handleFocusOrClick"
    @blur="handleBlur"
  >
    <span ref="el">
      {{ modelFormatted }}
    </span>

    <MenuProxy
      ref="menuProxyEl"
      v-model="isPickerActive"
      manual
      :reference-target="referenceEl"
      :fit="false"
      :ignore-click-outside="ignoredEls"
      position="top"
      placement="bottom-start"
      h="!auto"
      w="!auto"
      min-w="!280px"
      max-w="!400px"
      tabindex="-1"
      no-uplift
      @before-show="pickerState = 'show'"
      @before-hide="pickerState = 'hide'"
    >
      <YearSelector
        v-model="pickerModel"
        :utc
      />

      <Separator />

      <MonthSelectorGrid
        v-model="pickerModel"
        :utc
        @update:model-value="handleMonthSelect"
      />
    </MenuProxy>

    <template #append>
      <div
        :class="appendClass"
        :style="appendStyle"
      >
        <Btn
          v-if="clearable && modelValue && !readonly && !disabled"
          icon="i-eva:close-fill h-6 w-6"
          color="ca"
          size="auto"
          h="7"
          w="7"
          @click.stop.prevent="model = emptyValue"
        />

        <div
          i-formkit:month
          class="picker-icon"
          :class="pickerIconClass"
          :style="pickerIconStyle"
        />
      </div>
    </template>
  </Field>
</template>

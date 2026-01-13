<script setup lang="ts">
// TODO: MIN & MAX

// Types
import type { IYearMonthSelectorProps } from './types/year-month-selector-props.type'

// Functions
import { useFieldUtils } from '../Field/functions/useFieldUtils'

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

const modelFormatted = computed(() => {
  if (!model.value) {
    return ''
  }

  return capitalize(formatDate(model.value, 'yearMonth'))
})

// Picker
const referenceEl = ref<HTMLElement>()
const isPickerActive = ref(false)
const pickerState = ref('hide')

function handlePickerIconClick(ev: MouseEvent) {
  if (!isEditable.value) {
    return
  }

  if (isPickerActive.value) {
    ev.preventDefault()
    ev.stopPropagation()

    return
  }

  isPickerActive.value = true
}

function handleMonthSelect() {
  isPickerActive.value = false
  fieldEl.value?.focus()
}

// Field
const { el, getFieldProps, handleFocusOrClick, isEditable } = useFieldUtils({
  props,
  onBeforeFocus: ev => onBeforeFocus?.(ev, isPickerActive) ?? {},
  onFocus: ev => onFocus ? onFocus(ev, isPickerActive) : isPickerActive.value = true,
})

const fieldProps = getFieldProps(props)

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
    ref="fieldEl"
    v-bind="fieldProps"
    class="year-month-selector group/year-month-selector"
    :class="{ 'is-readonly': readonly, 'is-disabled': disabled }"
    :ui="mergedProps.ui"
    :has-content="!!model"
    .focus="handleFocusOrClick"
    @focus="!readonly && handleFocusOrClick($event)"
  >
    <span ref="el">
      {{ modelFormatted }}
    </span>

    <MenuProxy
      v-model="isPickerActive"
      manual
      :reference-target="referenceEl"
      :fit="false"
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
      <YearSelector v-model="model" />

      <Separator />

      <MonthSelectorGrid
        v-model="model"
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
          @mousedown="handlePickerIconClick"
          @click.stop.prevent
        />
      </div>
    </template>
  </Field>
</template>

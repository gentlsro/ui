<script setup lang="ts">
// TODO: MIN & MAX

// Types
import type { IYearMonthSelectorProps } from './types/year-month-selector-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'
import { useFieldUtils } from '../Field/functions/useFieldUtils'

// Components

const props = withDefaults(defineProps<IYearMonthSelectorProps>(), {
  ...getComponentProps('yearMonthSelector'),
})

defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'clear'): void
}>()

// Utils
const { d } = useI18n()

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

  return capitalize(d($date(model.value).valueOf(), 'yearMonth'))
})

// Picker
const referenceEl = ref<HTMLElement>()
const isPickerActive = ref(false)
const pickerState = ref('hide')

function handlePickerIconClick(ev: MouseEvent) {
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
const { el, getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  onBeforeFocus: ev => onBeforeFocus?.(ev, isPickerActive) ?? {},
  onFocus: ev => onFocus ? onFocus(ev, isPickerActive) : isPickerActive.value = true,
})

const fieldProps = getFieldProps(props)

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
        @update:model-value="handleMonthSelect"
      />
    </MenuProxy>

    <template #append>
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
        @mousedown="handlePickerIconClick"
        @click.stop.prevent
      />
    </template>
  </Field>
</template>

<style lang="scss" scoped>
.picker-icon {
  @apply cursor-pointer color-ca m-x-2 h-5.5 w-5.5;
}
</style>

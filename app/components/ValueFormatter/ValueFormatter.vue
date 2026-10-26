<script setup lang="ts" vapor>
import { isNil } from 'lodash-es'

// Types
import type { IValueFormatterProps } from './types/value-formatter-props.type'

// Constants
import { VALUE_FORMATTER_DEFAULT_PROPS } from './constants/value-formatter-default-props.constant'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IValueFormatterProps>(), {
  ...getComponentProps('valueFormatter'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('valueFormatter', props)
})

const { currentLocale } = useLocale()

const formattedValue = computed(() => {
  return formatValue(props.value, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
    predictDataType: props.predictDataType,
    comparator: props.comparator,
    localeIso: currentLocale.value.code,
    source: props.source,
  })
})

const formattedOriginalValue = computed(() => {
  return formatValue(props.previousValue, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
    predictDataType: props.predictDataType,
    comparator: props.comparator,
    localeIso: currentLocale.value.code,
    source: props.source,
  })
})

const isEmptyValue = computed(() => {
  return isNil(formattedValue.value)
    || formattedValue.value === ''
    || formattedValue.value === props.emptyValue
})

const isEmptyOriginalValue = computed(() => {
  return isNil(formattedOriginalValue.value)
    || formattedOriginalValue.value === ''
    || formattedOriginalValue.value === props.emptyValue
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: VALUE_FORMATTER_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <slot :val="formattedValue">
    <span
      v-bind="$attrs"
      :class="containerClass"
      :style="containerStyle"
    >
      {{ isEmptyValue ? emptyValueString : formattedValue }}
    </span>
  </slot>

  <slot
    name="previousValue"
    :val="formattedOriginalValue"
  >
    <span
      v-if="previousValue !== undefined"
      v-bind="$attrs"
      :class="containerClass"
      :style="containerStyle"
    >
      {{ isEmptyOriginalValue ? emptyValueString : formattedOriginalValue }}
    </span>
  </slot>
</template>

<script setup lang="ts">
// Types
import type { IValueFormatterProps } from './types/value-formatter-props.type'

// Functions
import { formatValue } from '$utils/shared/functions/format-value'
import { getComponentProps } from '../../functions/get-component-props'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<IValueFormatterProps>(), {
  ...getComponentProps('valueFormatter'),
})

// Utils
const { currentLocale } = useLocale()

const formattedValue = computed(() => {
  return formatValue(props.value, props.row, {
    dataType: props.dataType,
    format: props.format,
    emptyValue: props.emptyValue,
    predictDataType: props.predictDataType,
    comparator: props.comparator,
    localeIso: currentLocale.value.code,
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
  })
})

const isEmptyValue = computed(() => {
  return isNil(formattedValue) || formattedValue.value === props.emptyValue
})
</script>

<template>
  <slot :val="formattedValue">
    <span v-bind="$attrs">
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
    >
      {{
        isNil(formattedOriginalValue)
          ? emptyValueString
          : formattedOriginalValue
      }}
    </span>
  </slot>
</template>

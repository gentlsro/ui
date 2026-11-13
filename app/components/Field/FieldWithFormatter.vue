<script setup lang="ts">
// Types
import type { IFieldWithFormatterProps } from './types/field-with-formatter.type'

// Functions
import { useFieldUtils } from './functions/useFieldUtils'

const props = withDefaults(defineProps<IFieldWithFormatterProps>(), {
  ...getComponentProps('fieldWithFormatter'),
})

const mergedProps = computed(() => getComponentMergedProps('fieldWithFormatter', props))
const { getFieldProps } = useFieldUtils()
const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    v-bind="fieldProps"
    has-content
    :ui="mergedProps.ui"
    :model-value
  >
    <ValueFormatter
      :ui="mergedProps.ui"
      :value="modelValue"
      :data-type
    />

    <template
      v-if="$slots.append"
      #append
    >
      <slot name="append" />
    </template>
  </Field>
</template>

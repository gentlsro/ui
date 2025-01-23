<script setup lang="ts">
// Types
import type { IFieldWithFormatterProps } from './types/field-with-formatter.type'

// Functions
import { useFieldUtils } from './functions/useFieldUtils'
import { getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IFieldWithFormatterProps>(), {
  ...getComponentProps('fieldWithFormatter'),
})

const { getFieldProps } = useFieldUtils()
const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    v-bind="fieldProps"
    has-content
    :ui
    :model-value
  >
    <ValueFormatter
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

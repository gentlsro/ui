<script setup lang="ts">
// Types
import type { ExtendedDataType } from '$dataType'

// Functions
import { getInputByDataType } from './constants/input-by-datatype'

type IProps = {
  dataType: ExtendedDataType
  modelValue?: any
}

const props = defineProps<IProps>()

const component = getInputByDataType(props.dataType)
const model = defineModel<any>()
</script>

<template>
  <Component
    :is="component?.component"
    v-model="model"
    v-bind="component?.props"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>

    <template #append>
      <slot name="append" />
    </template>
  </Component>
</template>

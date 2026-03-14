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

const component = computed(() => getInputByDataType(props.dataType))
const model = defineModel<any>()

const el = ref<any>()

defineExpose({
  focus: () => el.value?.focus?.(),
})
</script>

<template>
  <Component
    :is="component?.component"
    v-bind="component?.props"
    ref="el"
    v-model="model"
  >
    <template #prepend>
      <slot name="prepend" />
    </template>

    <template #append>
      <slot name="append" />
    </template>
  </Component>
</template>

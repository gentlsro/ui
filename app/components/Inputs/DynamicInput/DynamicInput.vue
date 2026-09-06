<script setup lang="ts" vapor>
import { mergeProps } from 'vue'

// Types
import type { ExtendedDataType } from '$dataType'

// Functions
import { getInputByDataType } from './constants/input-by-datatype'

type IProps = {
  dataType: ExtendedDataType
  modelValue?: any
}

defineOptions({ inheritAttrs: false })

const props = defineProps<IProps>()

const component = computed(() => {
  return getInputByDataType(props.dataType)
})
const model = defineModel<any>()

const el = ref<{ focus?: () => void, select?: () => void }>()

defineExpose({
  focus: () => el.value?.focus?.(),
  select: () => {
    if (el.value?.select) {
      el.value.select()
    } else {
      el.value?.focus?.()
    }
  },
})
</script>

<template>
  <Component
    :is="component?.component"
    v-bind="mergeProps(component?.props ?? {}, $attrs)"
    ref="el"
    v-model="model"
  >
    <template
      v-if="$slots.prepend"
      #prepend="slotProps"
    >
      <slot
        name="prepend"
        v-bind="slotProps"
      />
    </template>

    <template
      v-if="$slots.append"
      #append="slotProps"
    >
      <slot
        name="append"
        v-bind="slotProps"
      />
    </template>
  </Component>
</template>

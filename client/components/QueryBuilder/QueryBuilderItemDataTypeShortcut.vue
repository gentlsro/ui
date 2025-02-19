<script setup lang="ts">
import type { ExtendedDataType } from '$dataType'

// Functions
import { getInputByDataType } from '../Inputs/DynamicInput/constants/input-by-datatype'

type IProps = {
  dataType: ExtendedDataType
  custom?: boolean
}

const props = defineProps<IProps>()

const component = computed(() => getInputByDataType(props.dataType))

const shortcutIcon = computed(() => {
  if (props.custom) {
    return 'i-carbon:area-custom'
  }

  return component.value?.icon
})
</script>

<template>
  <div
    v-if="shortcutIcon"
    class="data-type-icon"
    :class="shortcutIcon"
  />
</template>

<style scoped lang="scss">
.data-type-icon {
  @apply uppercase text-caption w-5 h-5 flex-inline;
}
</style>

<script setup lang="ts">
// Types
import type { ISelectorProps } from './types/selector-props.type'

// Functions
import { getListItemLabel } from '../List/functions/helpers'

type IProps = Pick<ISelectorProps, 'disabled' | 'readonly' | 'optionLabel' | 'chipProps'> & {
  chip: any
  optionByKey: Record<string, any>
}

const props = defineProps<IProps>()

defineEmits<{
  (e: 'remove'): void
}>()

const label = computed(() => {
  return getListItemLabel(props.chip, props.optionLabel, props.optionByKey)
})
</script>

<template>
  <Chip
    :label
    :has-remove="!(readonly || disabled)"
    v-bind="chipProps"
    @remove="$emit('remove')"
  />
</template>

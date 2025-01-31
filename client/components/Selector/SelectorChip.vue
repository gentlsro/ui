<script setup lang="ts">
// Types
import type { ISelectorProps } from './types/selector-props.type'

// Functions
import { getListItemLabel } from '../List/functions/helpers'

type IProps = Pick<ISelectorProps, 'disabled' | 'readonly' | 'optionLabel'> & {
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
    min-w="20"
    p="!y-1px"
    :has-remove="!(readonly || disabled)"
    @click.stop.prevent
    @remove="$emit('remove')"
  />
</template>

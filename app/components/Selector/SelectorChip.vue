<script setup lang="ts" vapor>
// Types
import type { ISelectorProps } from './types/selector-props.type'
import type { INavigation } from '../Button/types/btn-props.type'

// Functions
import { getListItemLabel } from '../List/functions/helpers'

type IProps = Pick<ISelectorProps, 'disabled' | 'readonly' | 'optionLabel' | 'chipProps'> & INavigation & {
  chip: any
  optionByKey: Record<string, any>
}

const props = withDefaults(defineProps<IProps>(), { prefetch: undefined })

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
    :to
    :disabled
    :external
    :download
    :replace
    :exact
    :target
    :rel
    :prefetch
    :no-prefetch
    :prefetch-on
    :navigate-to-options="navigateToOptions"
    v-bind="chipProps"
    @remove="$emit('remove')"
  />
</template>
